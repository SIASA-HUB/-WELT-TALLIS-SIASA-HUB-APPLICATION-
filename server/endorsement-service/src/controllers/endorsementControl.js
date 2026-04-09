const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Logger = require("../utils/logger/logger");
const {
  safeQuery,
  safeQueryOne,
  transaction,
} = require("../configurations/db");
const redis = require("../utils/redis/redis");
const { uploadEndorsementMedia } = require("../utils/uploader/imageUploader");

// ============================================
// STORY EXPIRATION RULES
// ============================================
const getExpirationHours = (boostPoints, totalBoostAmount) => {
  const points = boostPoints || 0;
  const amount = totalBoostAmount || 0;
  const effectiveScore = Math.max(points, amount / 10);

  if (effectiveScore >= 5000) return 30 * 24;
  if (effectiveScore >= 1000) return 14 * 24;
  if (effectiveScore >= 100) return 7 * 24;
  if (effectiveScore > 0) return 3 * 24;
  return 24;
};

const isStoryExpired = (createdAt, boostPoints, totalBoostAmount) => {
  const expirationHours = getExpirationHours(boostPoints, totalBoostAmount);
  const expirationTime = new Date(createdAt);
  expirationTime.setHours(expirationTime.getHours() + expirationHours);
  return new Date() > expirationTime;
};

// ============================================
// CACHE MANAGER - FIXED FOR YOUR REDIS CLIENT
// ============================================
class CacheManager {
  constructor() {
    this.defaultTTL = 300;
    this.hotDataTTL = 60;
    this.coldDataTTL = 3600;
  }

  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      Logger.error(`Cache get error: ${key}`, error);
      return null;
    }
  }

  async set(key, data, ttl = this.defaultTTL) {
    try {
      await redis.set(key, JSON.stringify(data), { ttl });
      return true;
    } catch (error) {
      Logger.error(`Cache set error: ${key}`, error);
      return false;
    }
  }

  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      Logger.error(`Cache delete error: ${key}`, error);
      return false;
    }
  }

  // FIXED: Pattern deletion using Redis SCAN via call method
  async delPattern(pattern) {
    try {
      let deletedCount = 0;
      let cursor = "0";

      // Use SCAN to find keys matching pattern
      do {
        // Use the call method for SCAN command
        const result = await redis.call(
          "SCAN",
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          "100",
        );
        cursor = result[0];
        const keys = result[1];

        if (keys && keys.length > 0) {
          // Delete each key
          for (const key of keys) {
            await redis.del(key);
            deletedCount++;
          }
        }
      } while (cursor !== "0");

      if (deletedCount > 0) {
        Logger.info(`Cleared ${deletedCount} cache keys matching: ${pattern}`);
      }

      return deletedCount;
    } catch (error) {
      Logger.error(`Cache pattern delete error: ${pattern}`, error);
      return 0;
    }
  }

  // Helper to clear all cache for a leader
  async clearLeaderCache(leaderId) {
    const patterns = [
      `leader:${leaderId}:recent_endorsements:*`,
      `leader:${leaderId}:active_stories:*`,
      `leader:${leaderId}:boosted_endorsements:*`,
      `leader:${leaderId}:trending_endorsements:*`,
      `leader:${leaderId}:endorsement_stats`,
    ];

    let totalCleared = 0;
    for (const pattern of patterns) {
      const cleared = await this.delPattern(pattern);
      totalCleared += cleared;
    }

    // Also clear global patterns
    await this.delPattern("global:trending_endorsements:*");
    await this.delPattern("global:trending:*");

    Logger.info(
      `✅ Cleared ${totalCleared} cache entries for leader: ${leaderId}`,
    );
    return totalCleared;
  }

  async getOrSet(key, fetcher, ttl = this.defaultTTL) {
    try {
      let data = await this.get(key);
      if (data !== null) return data;
      data = await fetcher();
      if (data) await this.set(key, data, ttl);
      return data;
    } catch (error) {
      Logger.error(`Cache getOrSet error: ${key}`, error);
      return await fetcher();
    }
  }
}

const cacheManager = new CacheManager();

// ============================================
// CREATE ENDORSEMENT - WITH IMMEDIATE CACHE CLEAR
// ============================================
const createEndorsement = [
  uploadEndorsementMedia,
  asyncHandler(async (req, res) => {
    let { leader_id, message, user_id, user_name } = req.body;

    const authenticatedUserId = req.user?.user_id;
    const authenticatedUserName = req.user?.name;

    const finalUserId = authenticatedUserId || user_id;
    const finalUserName = authenticatedUserName || user_name || "Anonymous";

    let mediaType = "text";
    let mediaUrl = null;
    let userMessage = message || "";

    // Check if file was processed by the middleware
    if (req.fileProcessed && req.mediaUrl) {
      mediaUrl = req.mediaUrl;
      mediaType = req.mediaType || "image";
      console.log(
        `📸 Media uploaded via middleware: ${mediaType} - ${mediaUrl}`,
      );
    }
    // Fallback: Manual file handling
    else if (req.file && !req.mediaUrl) {
      console.log("⚠️ Middleware didn't set mediaUrl, using fallback");
      const file = req.file;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const fileName = `${Date.now()}_${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname)}`;
      mediaUrl = `/uploads/endorsements/${year}/${month}/${fileName}`;
      mediaType = file.mimetype.startsWith("video/") ? "video" : "image";

      const uploadDir = path.join(
        __dirname,
        "../../uploads/endorsements",
        String(year),
        month,
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadDir, fileName), file.buffer);
      console.log(`📸 Fallback - Media saved: ${mediaUrl}`);
    }

    if (!leader_id || !finalUserId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    try {
      let result;

      await transaction(async (query) => {
        // Verify leader exists
        const leader = await query(
          `SELECT leader_id, name FROM leaders WHERE leader_id = ?`,
          [leader_id],
        );
        if (!leader || leader.length === 0) {
          throw new Error("Leader not found");
        }

        // Daily limit check
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const dailyCount = await query(
          `SELECT COUNT(*) as count FROM endorsements 
           WHERE user_id = ? AND created_at >= ? AND status = 'active'`,
          [finalUserId, todayStart],
        );
        const endorsementsToday = dailyCount[0]?.count || 0;

        if (endorsementsToday >= 100) {
          throw new Error(
            `Daily limit reached. You can only make 100 endorsements per day.`,
          );
        }

        // Prepare message
        let finalMessage = userMessage;
        if (mediaType === "image" && (!finalMessage || !finalMessage.trim())) {
          finalMessage = "📷 Photo";
        }
        if (mediaType === "video" && (!finalMessage || !finalMessage.trim())) {
          finalMessage = "📹 Video";
        }
        if (mediaType === "text" && (!finalMessage || !finalMessage.trim())) {
          finalMessage = "💬 Support message";
        }
        finalMessage = finalMessage.trim();

        const insertResult = await query(
          `INSERT INTO endorsements (
            leader_id, user_id, user_name, amount, phrase, message, 
            image_url, thumbnail_url, media_type, post_type, level, 
            status, created_at, boost_count, total_boost_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'bronze', 'active', NOW(), 0, 0)`,
          [
            leader_id,
            finalUserId,
            finalUserName,
            0,
            finalMessage.slice(0, 50),
            finalMessage,
            mediaUrl,
            null,
            mediaType,
            mediaType === "text" ? "text" : mediaType,
          ],
        );

        await query(
          `UPDATE leaders SET endorsement_count = COALESCE(endorsement_count, 0) + 1 WHERE leader_id = ?`,
          [leader_id],
        );

        result = await query(`SELECT * FROM endorsements WHERE id = ?`, [
          insertResult.insertId,
        ]);
      });

      // ============================================
      // CRITICAL: IMMEDIATELY CLEAR ALL CACHE
      // ============================================
      console.log(`🗑️ Clearing cache for leader: ${leader_id}`);

      // Clear all patterns for this leader
      await cacheManager.clearLeaderCache(leader_id);

      // Also clear specific known cache keys
      const specificKeys = [
        `leader:${leader_id}:recent_endorsements:100`,
        `leader:${leader_id}:recent_endorsements:200`,
        `leader:${leader_id}:active_stories:100`,
        `leader:${leader_id}:boosted_endorsements:20`,
        `leader:${leader_id}:boosted_endorsements:50`,
        `leader:${leader_id}:trending_endorsements:20:days:7`,
      ];

      for (const key of specificKeys) {
        await cacheManager.del(key);
      }

      console.log(`✅ Cache cleared successfully for leader: ${leader_id}`);

      Logger.info(
        `✅ Story posted: ${finalUserName} -> ${leader_id}, Type: ${mediaType}, MediaUrl: ${mediaUrl || "none"}`,
      );

      // Return the complete data
      return res.status(201).json({
        success: true,
        message: "Story posted successfully!",
        data: {
          ...result[0],
          image_url: mediaUrl,
          media_type: mediaType,
        },
      });
    } catch (error) {
      Logger.error("Error creating story:", error.message);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to post story",
      });
    }
  }),
];

// ============================================
// GET RECENT ENDORSEMENTS - WITH CACHE BYPASS OPTION
// ============================================
const getRecentEndorsements = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 100, 200);
  const bypassCache = req.query.bypass === "true";
  const cacheKey = `leader:${leaderId}:recent_endorsements:${limit}`;

  try {
    // Skip cache if bypass is requested
    let cached = null;
    if (!bypassCache) {
      cached = await cacheManager.get(cacheKey);
    }

    if (cached && !bypassCache) {
      return res
        .status(200)
        .json({ success: true, data: cached, source: "cache" });
    }

    const endorsements = await safeQuery(
      `SELECT id, user_id, user_name, amount, phrase, message, image_url, thumbnail_url,
              media_type, post_type, level, likes, views, shares, comments, 
              boost_count, total_boost_amount, created_at, status
       FROM endorsements 
       WHERE leader_id = ? AND status = 'active'
       ORDER BY created_at DESC
       LIMIT ?`,
      [leaderId, limit],
    );

    const processedEndorsements = endorsements.map((e) => ({
      id: e.id,
      user_id: e.user_id,
      user_name: e.user_name,
      message: e.message || "",
      media_type: e.media_type || "text",
      image_url: e.image_url,
      thumbnail_url: e.thumbnail_url,
      amount: e.amount,
      phrase: e.phrase,
      level: e.level,
      likes: e.likes || 0,
      views: e.views || 0,
      shares: e.shares || 0,
      comments: e.comments || 0,
      boost_count: e.boost_count || 0,
      total_boost_amount: e.total_boost_amount || 0,
      created_at: e.created_at,
      isFree: parseInt(e.amount) === 0,
      type: parseInt(e.amount) === 0 ? "free" : "paid",
    }));

    // Only cache if not bypassing
    if (!bypassCache) {
      await cacheManager.set(cacheKey, processedEndorsements, 60);
    }

    return res.status(200).json({
      success: true,
      data: processedEndorsements,
      source: "database",
      count: processedEndorsements.length,
    });
  } catch (error) {
    Logger.error("Error fetching recent endorsements:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ============================================
// GET ACTIVE STORIES
// ============================================
const getActiveStories = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 100, 200);
  const cacheKey = `leader:${leaderId}:active_stories:${limit}`;

  const data = await cacheManager.getOrSet(
    cacheKey,
    async () => {
      const endorsements = await safeQuery(
        `SELECT id, user_id, user_name, amount, phrase, message, image_url, thumbnail_url,
              media_type, post_type, level, likes, views, shares, comments, 
              boost_count, total_boost_amount, created_at
       FROM endorsements 
       WHERE leader_id = ? AND status = 'active'
       ORDER BY created_at DESC
       LIMIT ?`,
        [leaderId, limit],
      );

      const activeStories = endorsements.filter(
        (story) =>
          !isStoryExpired(
            story.created_at,
            story.boost_count,
            story.total_boost_amount,
          ),
      );

      return activeStories.map((e) => ({
        ...e,
        isFree: parseInt(e.amount) === 0,
        type: parseInt(e.amount) === 0 ? "free" : "paid",
        expiresIn: getExpirationHours(e.boost_count, e.total_boost_amount),
      }));
    },
    60,
  );

  return res.status(200).json({ success: true, data, total: data.length });
});

// ============================================
// GET BOOSTED ENDORSEMENTS
// ============================================
const getBoostedEndorsements = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const cacheKey = `leader:${leaderId}:boosted_endorsements:${limit}`;

  const data = await cacheManager.getOrSet(
    cacheKey,
    async () => {
      const endorsements = await safeQuery(
        `SELECT id, user_id, user_name, amount, phrase, message, image_url, thumbnail_url,
              media_type, post_type, level, likes, views, shares, comments,
              boost_count, total_boost_amount, created_at
       FROM endorsements 
       WHERE leader_id = ? AND status = 'active' AND (boost_count > 0 OR total_boost_amount > 0)
       ORDER BY total_boost_amount DESC, boost_count DESC, created_at DESC
       LIMIT ?`,
        [leaderId, limit],
      );

      return endorsements.map((e) => ({
        ...e,
        isFree: parseInt(e.amount) === 0,
        type: parseInt(e.amount) === 0 ? "free" : "paid",
        expiresIn: getExpirationHours(e.boost_count, e.total_boost_amount),
        isBoosted: true,
      }));
    },
    300,
  );

  return res.status(200).json({ success: true, data });
});

// ============================================
// GET TRENDING ENDORSEMENTS
// ============================================
const getTrendingEndorsements = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const days = parseInt(req.query.days) || 7;
  const cacheKey = `leader:${leaderId}:trending_endorsements:${limit}:days:${days}`;

  const data = await cacheManager.getOrSet(
    cacheKey,
    async () => {
      const endorsements = await safeQuery(
        `SELECT id, user_id, user_name, amount, phrase, message, image_url, thumbnail_url,
              media_type, post_type, level, likes, views, shares, comments,
              boost_count, total_boost_amount, created_at,
              (likes + views + shares + comments + COALESCE(boost_count, 0) * 5) as trending_score
       FROM endorsements 
       WHERE leader_id = ? AND status = 'active'
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY trending_score DESC, created_at DESC
       LIMIT ?`,
        [leaderId, days, limit],
      );

      return endorsements.map((e) => ({
        ...e,
        isFree: parseInt(e.amount) === 0,
        type: parseInt(e.amount) === 0 ? "free" : "paid",
      }));
    },
    180,
  );

  return res.status(200).json({ success: true, data });
});

// ============================================
// GLOBAL TRENDING ENDORSEMENTS
// ============================================
const getGlobalTrendingEndorsements = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const days = parseInt(req.query.days) || 7;
  const cacheKey = `global:trending_endorsements:${limit}:days:${days}`;

  const data = await cacheManager.getOrSet(
    cacheKey,
    async () => {
      const endorsements = await safeQuery(
        `SELECT 
        e.id, e.user_id, e.user_name, e.amount, e.phrase, e.message, 
        e.image_url, e.thumbnail_url, e.media_type, e.post_type,
        e.level, e.likes, e.views, e.shares, e.comments, e.created_at,
        e.boost_count, e.total_boost_amount,
        l.name as leader_name, l.leader_id, l.image_url as leader_image,
        (e.likes + e.views + e.shares + e.comments + COALESCE(e.boost_count, 0) * 5) as trending_score
      FROM endorsements e
      JOIN leaders l ON e.leader_id = l.leader_id
      WHERE e.status = 'active'
        AND e.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY trending_score DESC, e.created_at DESC
      LIMIT ?`,
        [days, limit],
      );

      return endorsements.map((e) => ({
        ...e,
        isFree: parseInt(e.amount) === 0,
        type: parseInt(e.amount) === 0 ? "free" : "paid",
      }));
    },
    180,
  );

  return res
    .status(200)
    .json({ success: true, data, meta: { total: data.length, limit, days } });
});

// ============================================
// LIKE ENDORSEMENT
// ============================================
const likeEndorsement = asyncHandler(async (req, res) => {
  const { endorsementId } = req.params;
  const { user_id } = req.body;
  const finalUserId = req.user?.user_id || user_id;

  if (!endorsementId || !finalUserId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    let liked = false;
    let likesCount = 0;
    let leaderId = null;

    await transaction(async (query) => {
      const endorsement = await query(
        `SELECT id, leader_id, likes FROM endorsements WHERE id = ?`,
        [endorsementId],
      );
      if (!endorsement || endorsement.length === 0)
        throw new Error("Endorsement not found");

      leaderId = endorsement[0].leader_id;
      const currentLikes = endorsement[0].likes || 0;

      await query(`
        CREATE TABLE IF NOT EXISTS endorsement_likes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          endorsement_id INT NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_like (endorsement_id, user_id)
        )
      `);

      const existing = await query(
        `SELECT id FROM endorsement_likes WHERE endorsement_id = ? AND user_id = ?`,
        [endorsementId, finalUserId],
      );

      if (existing && existing.length > 0) {
        await query(
          `DELETE FROM endorsement_likes WHERE endorsement_id = ? AND user_id = ?`,
          [endorsementId, finalUserId],
        );
        await query(
          `UPDATE endorsements SET likes = GREATEST(likes - 1, 0) WHERE id = ?`,
          [endorsementId],
        );
        liked = false;
        likesCount = currentLikes - 1;
      } else {
        await query(
          `INSERT INTO endorsement_likes (endorsement_id, user_id, created_at) VALUES (?, ?, NOW())`,
          [endorsementId, finalUserId],
        );
        await query(`UPDATE endorsements SET likes = likes + 1 WHERE id = ?`, [
          endorsementId,
        ]);
        liked = true;
        likesCount = currentLikes + 1;
      }
    });

    await cacheManager.invalidateLeaderCache(leaderId);

    return res.status(200).json({
      success: true,
      message: liked ? "Endorsement liked" : "Endorsement unliked",
      likes: likesCount,
      liked,
    });
  } catch (error) {
    Logger.error("Error liking endorsement:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to like endorsement",
    });
  }
});

// ============================================
// BOOST ENDORSEMENT
// ============================================
const boostEndorsement = asyncHandler(async (req, res) => {
  const { endorsementId } = req.params;
  const { user_id, amount } = req.body;
  const finalUserId = req.user?.user_id || user_id;
  const boostAmount = parseInt(amount) || 10;

  if (!endorsementId || !finalUserId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const allowedAmounts = [10, 50, 100, 500];
  if (!allowedAmounts.includes(boostAmount)) {
    return res.status(400).json({
      success: false,
      message: "Invalid boost amount. Allowed: 10, 50, 100, 500 KES",
    });
  }

  try {
    let leaderId = null;
    let endorsementData = null;

    await transaction(async (query) => {
      const endorsement = await query(
        `SELECT id, leader_id, amount, boost_count, total_boost_amount FROM endorsements WHERE id = ?`,
        [endorsementId],
      );
      if (!endorsement || endorsement.length === 0)
        throw new Error("Endorsement not found");

      endorsementData = endorsement[0];
      leaderId = endorsementData.leader_id;

      const wallet = await query(
        `SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE`,
        [finalUserId],
      );
      if (!wallet || wallet.length === 0) throw new Error(`Wallet not found`);

      const currentBalance = parseFloat(wallet[0].balance);
      if (currentBalance < boostAmount)
        throw new Error(
          `Insufficient balance. Need KES ${boostAmount}, have KES ${currentBalance}`,
        );

      await query(
        `UPDATE user_wallets SET balance = balance - ?, total_spent = total_spent + ?, updated_at = NOW() WHERE user_id = ?`,
        [boostAmount, boostAmount, finalUserId],
      );

      await query(
        `CREATE TABLE IF NOT EXISTS endorsement_boosts (id INT PRIMARY KEY AUTO_INCREMENT, endorsement_id INT NOT NULL, user_id VARCHAR(255) NOT NULL, amount INT NOT NULL DEFAULT 10, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_endorsement (endorsement_id), INDEX idx_user (user_id))`,
      );

      await query(
        `INSERT INTO endorsement_boosts (endorsement_id, user_id, amount, created_at) VALUES (?, ?, ?, NOW())`,
        [endorsementId, finalUserId, boostAmount],
      );

      await query(
        `UPDATE endorsements SET boost_count = COALESCE(boost_count, 0) + 1, total_boost_amount = COALESCE(total_boost_amount, 0) + ?, updated_at = NOW() WHERE id = ?`,
        [boostAmount, endorsementId],
      );
    });

    await cacheManager.invalidateLeaderCache(leaderId);
    await cacheManager.delPattern("global:trending:*");

    const updatedWallet = await safeQueryOne(
      `SELECT balance FROM user_wallets WHERE user_id = ?`,
      [finalUserId],
    );
    const newExpiration = getExpirationHours(
      (endorsementData?.boost_count || 0) + 1,
      (endorsementData?.total_boost_amount || 0) + boostAmount,
    );

    return res.status(200).json({
      success: true,
      message: `Endorsement boosted with KES ${boostAmount}!`,
      data: {
        endorsement_id: endorsementId,
        amount: boostAmount,
        new_balance: updatedWallet?.balance || 0,
        boost_count: (endorsementData?.boost_count || 0) + 1,
        expiresIn: newExpiration,
      },
    });
  } catch (error) {
    Logger.error("Error boosting endorsement:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to boost endorsement",
    });
  }
});

// ============================================
// COMMENT FUNCTIONS
// ============================================

// Add a comment to an endorsement
const addComment = asyncHandler(async (req, res) => {
  const { endorsementId } = req.params;
  const { comment, user_id, user_name, user_avatar } = req.body;
  const authenticatedUserId = req.user?.user_id;
  const authenticatedUserName = req.user?.name;

  const finalUserId = authenticatedUserId || user_id;
  const finalUserName = authenticatedUserName || user_name || "Anonymous";

  if (!endorsementId || !comment || !finalUserId) {
    return res.status(400).json({
      success: false,
      message: "Missing: endorsementId, comment, user_id",
    });
  }

  try {
    let newComment;

    await transaction(async (query) => {
      const endorsement = await query(
        `SELECT id, leader_id FROM endorsements WHERE id = ?`,
        [endorsementId],
      );

      if (!endorsement || endorsement.length === 0) {
        throw new Error("Endorsement not found");
      }

      await query(`
        CREATE TABLE IF NOT EXISTS endorsement_comments (
          id INT PRIMARY KEY AUTO_INCREMENT,
          endorsement_id INT NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          user_name VARCHAR(255),
          user_avatar TEXT,
          comment TEXT NOT NULL,
          likes INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_endorsement (endorsement_id),
          INDEX idx_user (user_id)
        )
      `);

      const insertResult = await query(
        `INSERT INTO endorsement_comments (
          endorsement_id, user_id, user_name, user_avatar, comment, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          endorsementId,
          finalUserId,
          finalUserName,
          user_avatar || null,
          comment,
        ],
      );

      await query(
        `UPDATE endorsements SET comments = comments + 1 WHERE id = ?`,
        [endorsementId],
      );

      newComment = await query(
        `SELECT id, user_id, user_name, user_avatar, comment, likes, created_at 
         FROM endorsement_comments WHERE id = ?`,
        [insertResult.insertId],
      );
    });

    await cacheManager.delPattern(`endorsement:${endorsementId}:comments:*`);

    return res.status(201).json({
      success: true,
      message: "Comment added",
      data: newComment[0],
    });
  } catch (error) {
    Logger.error("Error adding comment:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add comment",
    });
  }
});

// Get comments for an endorsement
const getComments = asyncHandler(async (req, res) => {
  const { endorsementId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = parseInt(req.query.offset) || 0;
  const cacheKey = `endorsement:${endorsementId}:comments:limit:${limit}:offset:${offset}`;

  try {
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "cache",
        data: cached,
      });
    }

    const comments = await safeQuery(
      `SELECT id, user_id, user_name, user_avatar, comment, likes, created_at
       FROM endorsement_comments 
       WHERE endorsement_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [endorsementId, limit, offset],
    );

    const countResult = await safeQueryOne(
      `SELECT COUNT(*) as total FROM endorsement_comments WHERE endorsement_id = ?`,
      [endorsementId],
    );

    const response = {
      comments,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset,
      },
    };

    await cacheManager.set(cacheKey, response, 60);

    return res.status(200).json({
      success: true,
      source: "database",
      data: response,
    });
  } catch (error) {
    Logger.error("Error fetching comments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
});

// Like a comment
const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { user_id } = req.body;
  const authenticatedUserId = req.user?.user_id;
  const finalUserId = authenticatedUserId || user_id;

  if (!commentId || !finalUserId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    let liked = false;
    let likesCount = 0;

    await transaction(async (query) => {
      await query(`
        CREATE TABLE IF NOT EXISTS comment_likes (
          id INT PRIMARY KEY AUTO_INCREMENT,
          comment_id INT NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_comment_like (comment_id, user_id)
        )
      `);

      const existing = await query(
        `SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
        [commentId, finalUserId],
      );

      if (existing.length > 0) {
        await query(
          `DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?`,
          [commentId, finalUserId],
        );
        await query(
          `UPDATE endorsement_comments SET likes = GREATEST(likes - 1, 0) WHERE id = ?`,
          [commentId],
        );
        liked = false;
      } else {
        await query(
          `INSERT INTO comment_likes (comment_id, user_id, created_at) VALUES (?, ?, NOW())`,
          [commentId, finalUserId],
        );
        await query(
          `UPDATE endorsement_comments SET likes = likes + 1 WHERE id = ?`,
          [commentId],
        );
        liked = true;
      }

      const result = await query(
        `SELECT likes FROM endorsement_comments WHERE id = ?`,
        [commentId],
      );
      likesCount = result[0]?.likes || 0;
    });

    await cacheManager.delPattern(`endorsement:*:comments:*`);

    return res.status(200).json({
      success: true,
      message: liked ? "Comment liked" : "Comment unliked",
      likes: likesCount,
      liked,
    });
  } catch (error) {
    Logger.error("Error liking comment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to like comment",
    });
  }
});

// Get single endorsement stats
const getEndorsementStats = asyncHandler(async (req, res) => {
  const { endorsementId } = req.params;

  try {
    const stats = await safeQueryOne(
      `SELECT 
        e.id, e.likes, e.views, e.shares, e.comments,
        e.is_pinned, e.pinned_at,
        COALESCE(e.boost_count, 0) as boost_count,
        COALESCE(e.total_boost_amount, 0) as total_boost_amount,
        (e.likes + e.views + e.shares + e.comments + COALESCE(e.boost_count, 0) * 5) as trending_score
       FROM endorsements e
       WHERE e.id = ?`,
      [endorsementId],
    );

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    Logger.error("Error fetching endorsement stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
});

// ============================================
// GET LEADER ENDORSEMENT STATS
// ============================================
const getLeaderEndorsementStats = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const cacheKey = `leader:${leaderId}:endorsement_stats`;

  const stats = await cacheManager.getOrSet(
    cacheKey,
    async () => {
      return await safeQueryOne(
        `SELECT 
        COUNT(*) as total_endorsements, 
        COUNT(DISTINCT user_id) as unique_supporters,
        SUM(CASE WHEN amount = 0 THEN 1 ELSE 0 END) as free_endorsements,
        SUM(CASE WHEN amount > 0 THEN 1 ELSE 0 END) as paid_endorsements,
        SUM(likes) as total_likes,
        SUM(comments) as total_comments,
        SUM(boost_count) as total_boosts,
        SUM(total_boost_amount) as total_boost_amount
       FROM endorsements 
       WHERE leader_id = ? AND status = 'active'`,
        [leaderId],
      );
    },
    3600,
  );

  return res.status(200).json({ success: true, data: stats });
});

// ============================================
// CLEANUP EXPIRED STORIES
// ============================================
const cleanupExpiredStories = async () => {
  try {
    const allStories = await safeQuery(
      `SELECT id, created_at, boost_count, total_boost_amount FROM endorsements WHERE status = 'active'`,
    );
    let expiredCount = 0;

    for (const story of allStories) {
      if (
        isStoryExpired(
          story.created_at,
          story.boost_count,
          story.total_boost_amount,
        )
      ) {
        await safeQuery(
          `UPDATE endorsements SET status = 'expired', updated_at = NOW() WHERE id = ?`,
          [story.id],
        );
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      Logger.info(`🧹 Cleaned up ${expiredCount} expired stories`);
      await cacheManager.delPattern("leader:*:active_stories:*");
      await cacheManager.delPattern("leader:*:recent_endorsements:*");
      await cacheManager.delPattern("global:trending:*");
    }
  } catch (error) {
    Logger.error("Error cleaning up expired stories:", error);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredStories, 60 * 60 * 1000);

// ============================================
// EXPORTS
// ============================================
module.exports = {
  createEndorsement,
  getActiveStories,
  getRecentEndorsements,
  getBoostedEndorsements,
  getTrendingEndorsements,
  getGlobalTrendingEndorsements,
  likeEndorsement,
  boostEndorsement,
  getLeaderEndorsementStats,
  cleanupExpiredStories,
  addComment,
  getComments,
  likeComment,
  getEndorsementStats,
};
