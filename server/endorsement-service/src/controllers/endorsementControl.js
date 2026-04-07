const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const Logger = require("../utils/logger/logger");
const {
  safeQuery,
  safeQueryOne,
  transaction,
} = require("../configurations/db");
const redis = require("../utils/redis/redis");
const { uploadEndorsementImage } = require("../utils/uploader/imageUploader");

// ============================================
// HELPER: REDIS CACHE MANAGEMENT
// ============================================

const setRedisCache = async (key, data, ttlSeconds = 300) => {
  try {
    const value = JSON.stringify(data);
    if (redis.setEx) {
      await redis.setEx(key, ttlSeconds, value);
    } else {
      await redis.set(key, value, { EX: ttlSeconds });
    }
  } catch (error) {
    Logger.error("Error setting Redis cache:", error);
  }
};

const clearLeaderCaches = async (leaderId) => {
  try {
    const patterns = [
      `leader:${leaderId}:endorsements:*`,
      `leader:${leaderId}:recent_endorsements:*`,
      `leader:${leaderId}:boosted_endorsements:*`,
      `leader:${leaderId}:trending_endorsements:*`,
      `leader:${leaderId}:endorsement_stats`,
      `leader:${leaderId}:comments:*`,
    ];

    for (const pattern of patterns) {
      let keys = [];

      if (typeof redis.keys === "function") {
        keys = await redis.keys(pattern);
      } else if (redis.sendCommand) {
        keys = await redis.sendCommand(["KEYS", pattern]);
      }

      if (keys && keys.length > 0) {
        for (const key of keys) {
          await redis.del(key);
        }
        Logger.info(
          `Cleared ${keys.length} cached keys for pattern: ${pattern}`,
        );
      }
    }
  } catch (error) {
    Logger.error("Error clearing leader caches:", error);
  }
};

// ============================================
// CHECK FREE ENDORSEMENT LIMIT (1 per week)
// ============================================

const checkFreeEndorsementLimit = async (query, userId, leaderId) => {
  const freeEndorsement = await query(
    `SELECT id, created_at FROM endorsements 
     WHERE user_id = ? AND leader_id = ? AND amount = 0 
     AND status = 'active' 
     AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     ORDER BY created_at DESC 
     LIMIT 1`,
    [userId, leaderId],
  );

  if (freeEndorsement && freeEndorsement.length > 0) {
    const daysSince = Math.ceil(
      (new Date() - new Date(freeEndorsement[0].created_at)) /
        (1000 * 60 * 60 * 24),
    );
    const daysRemaining = 7 - daysSince;
    return {
      allowed: false,
      message: `You can only make 1 free endorsement per week. ${daysRemaining} days remaining.`,
      lastEndorsement: freeEndorsement[0].created_at,
      daysRemaining,
    };
  }

  return { allowed: true };
};

// ============================================
// CHECK PAID ENDORSEMENT LIMIT (1 per day)
// ============================================

const checkPaidEndorsementLimit = async (query, userId, leaderId) => {
  const paidEndorsement = await query(
    `SELECT id, created_at, amount FROM endorsements 
     WHERE user_id = ? AND leader_id = ? AND amount > 0 
     AND status = 'active' 
     AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
     ORDER BY created_at DESC 
     LIMIT 1`,
    [userId, leaderId],
  );

  if (paidEndorsement && paidEndorsement.length > 0) {
    const hoursSince = Math.ceil(
      (new Date() - new Date(paidEndorsement[0].created_at)) / (1000 * 60 * 60),
    );
    const hoursRemaining = 24 - hoursSince;
    return {
      allowed: false,
      message: `You can only make 1 paid endorsement per day. ${hoursRemaining} hours remaining.`,
      lastEndorsement: paidEndorsement[0].created_at,
      hoursRemaining,
    };
  }

  return { allowed: true };
};

// ============================================
// CREATE ENDORSEMENT (Free with weekly limit, Paid with daily limit)
// ============================================

const createEndorsement = [
  uploadEndorsementImage,
  asyncHandler(async (req, res) => {
    let { leader_id, amount, phrase, message, level, user_id, user_name } =
      req.body;
    const authenticatedUserId = req.user?.user_id;
    const authenticatedUserName = req.user?.name;

    const finalUserId = authenticatedUserId || user_id;
    const finalUserName = authenticatedUserName || user_name || "Anonymous";

    const numericAmount = parseInt(amount) || 0;

    if (!leader_id || !phrase || !finalUserId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: leader_id, phrase, user_id",
      });
    }

    const allowedAmounts = [0, 10, 50, 100];
    if (!allowedAmounts.includes(numericAmount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount. Allowed: 0 (Free), 10, 50, 100 KES",
      });
    }

    const image_url = req.imageUrls?.card || null;
    const isFree = numericAmount === 0;

    try {
      let result;

      await transaction(async (query) => {
        // REMOVED status check - any leader can receive endorsements
        const leader = await query(
          `SELECT leader_id, name FROM leaders WHERE leader_id = ?`,
          [leader_id],
        );

        if (!leader || leader.length === 0) {
          throw new Error("Leader not found");
        }

        // CHECK ENDORSEMENT LIMITS
        if (isFree) {
          const limitCheck = await checkFreeEndorsementLimit(
            query,
            finalUserId,
            leader_id,
          );
          if (!limitCheck.allowed) {
            throw new Error(limitCheck.message);
          }
        } else {
          const limitCheck = await checkPaidEndorsementLimit(
            query,
            finalUserId,
            leader_id,
          );
          if (!limitCheck.allowed) {
            throw new Error(limitCheck.message);
          }
        }

        // Process payment if not free
        if (!isFree) {
          const wallet = await query(
            `SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE`,
            [finalUserId],
          );

          if (!wallet || wallet.length === 0) {
            throw new Error(`Wallet not found. Need KES ${numericAmount}`);
          }

          const currentBalance = parseFloat(wallet[0].balance);

          if (currentBalance < numericAmount) {
            throw new Error(
              `Insufficient balance. Need KES ${numericAmount}, have KES ${currentBalance}`,
            );
          }

          await query(
            `UPDATE user_wallets 
             SET balance = balance - ?,
                 total_spent = total_spent + ?,
                 updated_at = NOW()
             WHERE user_id = ?`,
            [numericAmount, numericAmount, finalUserId],
          );

          // Record transaction
          const transactionId = `END-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
          await query(
            `INSERT INTO wallet_transactions 
             (transaction_id, user_id, amount, type, reference_id, description, status, completed_at)
             VALUES (?, ?, ?, 'endorsement', ?, ?, 'completed', NOW())`,
            [
              transactionId,
              finalUserId,
              numericAmount,
              leader_id,
              `Paid endorsement for leader ${leader_id}`,
            ],
          );

          Logger.info(
            `💰 Paid endorsement: User ${finalUserId}, Amount: ${numericAmount}`,
          );
        } else {
          Logger.info(
            `✨ Free endorsement: User ${finalUserId} (1 per week limit)`,
          );
        }

        const insertResult = await query(
          `INSERT INTO endorsements (
            leader_id, user_id, user_name, amount, phrase, 
            message, image_url, level, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
          [
            leader_id,
            finalUserId,
            finalUserName,
            numericAmount,
            phrase,
            message || null,
            image_url,
            level || "bronze",
          ],
        );

        const endorsementId = insertResult.insertId;

        await query(
          `UPDATE leaders SET endorsement_count = COALESCE(endorsement_count, 0) + 1 WHERE leader_id = ?`,
          [leader_id],
        );

        result = await query(`SELECT * FROM endorsements WHERE id = ?`, [
          endorsementId,
        ]);
      });

      await clearLeaderCaches(leader_id);

      Logger.info(
        `✅ Endorsement Created: User ${finalUserId} -> Leader ${leader_id}, Amount: ${numericAmount}`,
      );

      return res.status(201).json({
        success: true,
        message: isFree
          ? "Free endorsement created! (1 per week limit)"
          : `Paid endorsement of KES ${numericAmount} created! (1 per day limit)`,
        data: result[0],
      });
    } catch (error) {
      Logger.error("Error creating endorsement:", error.message);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create endorsement",
      });
    }
  }),
];

// ============================================
// BOOST ENDORSEMENT (Paid - appears on trending)
// ============================================

const boostEndorsement = asyncHandler(async (req, res) => {
  const { endorsementId } = req.params;
  const { user_id, amount } = req.body;
  const authenticatedUserId = req.user?.user_id;
  const finalUserId = authenticatedUserId || user_id;
  const boostAmount = parseInt(amount) || 10;

  Logger.info(
    `Boost endorsement: id=${endorsementId}, userId=${finalUserId}, amount=${boostAmount}`,
  );

  if (!endorsementId || !finalUserId) {
    return res.status(400).json({
      success: false,
      message: "Missing: endorsementId and user_id required",
    });
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
      // REMOVED status check - any endorsement can be boosted
      const endorsement = await query(
        `SELECT id, leader_id, amount, boost_count, total_boost_amount 
         FROM endorsements WHERE id = ?`,
        [endorsementId],
      );

      if (!endorsement || endorsement.length === 0) {
        throw new Error("Endorsement not found");
      }

      endorsementData = endorsement[0];
      leaderId = endorsementData.leader_id;

      // Check wallet balance
      const wallet = await query(
        `SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE`,
        [finalUserId],
      );

      if (!wallet || wallet.length === 0) {
        throw new Error(`Wallet not found for user ${finalUserId}`);
      }

      const currentBalance = parseFloat(wallet[0].balance);

      if (currentBalance < boostAmount) {
        throw new Error(
          `Insufficient balance. Need KES ${boostAmount}, have KES ${currentBalance}`,
        );
      }

      // Deduct from wallet
      await query(
        `UPDATE user_wallets 
         SET balance = balance - ?,
             total_spent = total_spent + ?,
             updated_at = NOW()
         WHERE user_id = ?`,
        [boostAmount, boostAmount, finalUserId],
      );

      // Record transaction
      const transactionId = `BOOST-END-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
      await query(
        `INSERT INTO wallet_transactions 
         (transaction_id, user_id, amount, type, reference_id, description, status, completed_at)
         VALUES (?, ?, ?, 'endorsement_boost', ?, ?, 'completed', NOW())`,
        [
          transactionId,
          finalUserId,
          boostAmount,
          endorsementId,
          `Boost for endorsement ${endorsementId}`,
        ],
      );

      // Create boosts table if not exists
      await query(`
        CREATE TABLE IF NOT EXISTS endorsement_boosts (
          id INT PRIMARY KEY AUTO_INCREMENT,
          endorsement_id INT NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          amount INT NOT NULL DEFAULT 10,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_endorsement (endorsement_id),
          INDEX idx_user (user_id)
        )
      `);

      // Record the boost
      await query(
        `INSERT INTO endorsement_boosts (endorsement_id, user_id, amount, created_at) 
         VALUES (?, ?, ?, NOW())`,
        [endorsementId, finalUserId, boostAmount],
      );

      // Update endorsement with boost stats
      await query(
        `UPDATE endorsements 
         SET boost_count = COALESCE(boost_count, 0) + 1,
             total_boost_amount = COALESCE(total_boost_amount, 0) + ?,
             updated_at = NOW()
         WHERE id = ?`,
        [boostAmount, endorsementId],
      );

      Logger.info(
        `🚀 Endorsement boosted: ${endorsementId} with ${boostAmount} KES by ${finalUserId}`,
      );
    });

    // Clear caches
    if (leaderId) {
      await clearLeaderCaches(leaderId);
    }
    await redis.del(`global:trending_endorsements:*`);

    // Get updated wallet balance
    const updatedWallet = await safeQueryOne(
      `SELECT balance FROM user_wallets WHERE user_id = ?`,
      [finalUserId],
    );

    return res.status(200).json({
      success: true,
      message: `Endorsement boosted with KES ${boostAmount}! It will now appear in trending.`,
      data: {
        endorsement_id: endorsementId,
        amount: boostAmount,
        new_balance: updatedWallet?.balance || 0,
        boost_count: (endorsementData?.boost_count || 0) + 1,
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
// LIKE ENDORSEMENT
// ============================================

const likeEndorsement = asyncHandler(async (req, res) => {
  const { endorsementId } = req.params;
  const { user_id } = req.body;
  const authenticatedUserId = req.user?.user_id;
  const finalUserId = authenticatedUserId || user_id;

  if (!endorsementId || !finalUserId) {
    return res.status(400).json({
      success: false,
      message: "Missing: endorsementId and user_id required",
    });
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

      if (!endorsement || endorsement.length === 0) {
        throw new Error("Endorsement not found");
      }

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

    if (leaderId) {
      await clearLeaderCaches(leaderId);
    }

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
// GET RECENT ENDORSEMENTS
// ============================================

const getRecentEndorsements = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const cacheKey = `leader:${leaderId}:recent_endorsements:${limit}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "cache",
        data: JSON.parse(cached),
      });
    }

    const endorsements = await safeQuery(
      `SELECT id, user_id, user_name, amount, phrase, message, image_url, 
              level, likes, views, shares, comments, is_pinned, created_at,
              COALESCE(boost_count, 0) as boost_count,
              COALESCE(total_boost_amount, 0) as total_boost_amount
       FROM endorsements 
       WHERE leader_id = ? AND status = 'active'
       ORDER BY created_at DESC
       LIMIT ?`,
      [leaderId, limit],
    );

    const processedEndorsements = endorsements.map((e) => ({
      ...e,
      isFree: parseInt(e.amount) === 0,
      type: parseInt(e.amount) === 0 ? "free" : "paid",
    }));

    await setRedisCache(cacheKey, processedEndorsements, 30);

    return res.status(200).json({
      success: true,
      source: "database",
      data: processedEndorsements,
    });
  } catch (error) {
    Logger.error("Error fetching recent endorsements:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// ============================================
// GET BOOSTED ENDORSEMENTS (Trending by boosts)
// ============================================

const getBoostedEndorsements = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const cacheKey = `leader:${leaderId}:boosted_endorsements:${limit}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "cache",
        data: JSON.parse(cached),
      });
    }

    const endorsements = await safeQuery(
      `SELECT id, user_id, user_name, amount, phrase, message, image_url, 
              level, likes, views, shares, comments, created_at,
              COALESCE(boost_count, 0) as boost_count,
              COALESCE(total_boost_amount, 0) as total_boost_amount
      FROM endorsements 
      WHERE leader_id = ? AND status = 'active'
      ORDER BY boost_count DESC, total_boost_amount DESC, created_at DESC
      LIMIT ?`,
      [leaderId, limit],
    );

    const processedEndorsements = endorsements.map((e) => ({
      ...e,
      isFree: parseInt(e.amount) === 0,
      type: parseInt(e.amount) === 0 ? "free" : "paid",
    }));

    await setRedisCache(cacheKey, processedEndorsements, 300);

    return res.status(200).json({
      success: true,
      source: "database",
      data: processedEndorsements,
    });
  } catch (error) {
    Logger.error("Error fetching boosted endorsements:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// ============================================
// GET TRENDING ENDORSEMENTS (Highest engagement + boosts)
// ============================================

const getTrendingEndorsements = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const days = parseInt(req.query.days) || 7;
  const cacheKey = `leader:${leaderId}:trending_endorsements:${limit}:days:${days}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "cache",
        data: JSON.parse(cached),
      });
    }

    const endorsements = await safeQuery(
      `SELECT id, user_id, user_name, amount, phrase, message, image_url, 
              level, likes, views, shares, comments, created_at,
              COALESCE(boost_count, 0) as boost_count,
              COALESCE(total_boost_amount, 0) as total_boost_amount,
              (likes + views + shares + comments + COALESCE(boost_count, 0) * 5) as trending_score
      FROM endorsements 
      WHERE leader_id = ? AND status = 'active'
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY trending_score DESC, created_at DESC
      LIMIT ?`,
      [leaderId, days, limit],
    );

    const processedEndorsements = endorsements.map((e) => ({
      ...e,
      isFree: parseInt(e.amount) === 0,
      type: parseInt(e.amount) === 0 ? "free" : "paid",
    }));

    await setRedisCache(cacheKey, processedEndorsements, 180);

    return res.status(200).json({
      success: true,
      source: "database",
      data: processedEndorsements,
    });
  } catch (error) {
    Logger.error("Error fetching trending endorsements:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// ============================================
// GLOBAL TRENDING ENDORSEMENTS (All leaders)
// ============================================

const getGlobalTrendingEndorsements = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const days = parseInt(req.query.days) || 7;
  const cacheKey = `global:trending_endorsements:${limit}:days:${days}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "cache",
        data: JSON.parse(cached),
      });
    }

    // REMOVED leader status check
    const endorsements = await safeQuery(
      `SELECT 
        e.id, e.user_id, e.user_name, e.amount, e.phrase, e.message, 
        e.image_url, e.level, e.likes, e.views, e.shares, e.comments, e.created_at,
        COALESCE(e.boost_count, 0) as boost_count,
        COALESCE(e.total_boost_amount, 0) as total_boost_amount,
        l.name as leader_name,
        l.leader_id,
        l.image_url as leader_image,
        (e.likes + e.views + e.shares + e.comments + COALESCE(e.boost_count, 0) * 5) as trending_score
      FROM endorsements e
      JOIN leaders l ON e.leader_id = l.leader_id
      WHERE e.status = 'active'
        AND e.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY trending_score DESC, e.created_at DESC
      LIMIT ?`,
      [days, limit],
    );

    const processedEndorsements = endorsements.map((e) => ({
      ...e,
      isFree: parseInt(e.amount) === 0,
      type: parseInt(e.amount) === 0 ? "free" : "paid",
    }));

    await setRedisCache(cacheKey, processedEndorsements, 180);

    return res.status(200).json({
      success: true,
      source: "database",
      data: processedEndorsements,
      meta: {
        total: processedEndorsements.length,
        limit,
        days,
      },
    });
  } catch (error) {
    Logger.error("Error fetching global trending endorsements:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// ============================================
// COMMENT FUNCTIONS
// ============================================

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

    await redis.del(`endorsement:${endorsementId}:comments:*`);

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

const getComments = asyncHandler(async (req, res) => {
  const { endorsementId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = parseInt(req.query.offset) || 0;
  const cacheKey = `endorsement:${endorsementId}:comments:limit:${limit}:offset:${offset}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "cache",
        data: JSON.parse(cached),
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

    await setRedisCache(cacheKey, response, 60);

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

    await redis.del(`endorsement:*:comments:*`);

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

// ============================================
// STATS FUNCTIONS
// ============================================

const getLeaderEndorsementStats = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const cacheKey = `leader:${leaderId}:endorsement_stats`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "cache",
        data: JSON.parse(cached),
      });
    }

    const stats = await safeQueryOne(
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

    await setRedisCache(cacheKey, stats, 300);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    Logger.error("Error fetching stats:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

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
// EXPORTS
// ============================================

module.exports = {
  createEndorsement,
  getRecentEndorsements,
  getBoostedEndorsements,
  getTrendingEndorsements,
  getLeaderEndorsementStats,
  addComment,
  getComments,
  likeComment,
  getEndorsementStats,
  likeEndorsement,
  boostEndorsement,
  getGlobalTrendingEndorsements,
};
