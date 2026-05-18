// endorsementController.js 

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Logger = require("../utils/logger/logger");
const {
  asyncHandler,
  redis,
  db: { safeQuery, safeQueryOne, transaction },
  utils: { getKenyaTimeISO },
} = require("../../../global/index");
const { uploadEndorsementMedia } = require("../utils/uploader/imageUploader");

// ============================================
// VIDEO CACHE MANAGER - OPTIMIZED DELIVERY
// ============================================
class VideoCacheManager {
  constructor() {
    this.videoCacheDir = path.join(__dirname, "../../../uploads/video_cache");
    this.cacheMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.videoTTL = 3600; // 1 hour in Redis

    // Ensure cache directory exists
    if (!fs.existsSync(this.videoCacheDir)) {
      fs.mkdirSync(this.videoCacheDir, { recursive: true });
    }
  }

  // Generate cache key for video
  getVideoCacheKey(mediaUrl, quality = "medium") {
    const urlHash = crypto.createHash('md5').update(mediaUrl).digest('hex');
    return `video_cache:${urlHash}:${quality}`;
  }

  // Get video from cache with metadata
  async getCachedVideo(mediaUrl, quality = "medium") {
    if (!redis) return null;
    try {
      const cacheKey = this.getVideoCacheKey(mediaUrl, quality);
      const cached = await redis.get(cacheKey);
      if (cached) {
        const videoData = JSON.parse(cached);
        // Check if physical file still exists
        if (fs.existsSync(videoData.cachePath)) {
          return videoData;
        }
        // File missing, remove from cache
        await redis.del(cacheKey);
      }
      return null;
    } catch (error) {
      Logger.error(`Video cache get error: ${mediaUrl}`, error);
      return null;
    }
  }

  // Cache video with metadata
  async setCachedVideo(mediaUrl, videoData, quality = "medium") {
    if (!redis) return false;
    try {
      const cacheKey = this.getVideoCacheKey(mediaUrl, quality);
      await redis.set(cacheKey, JSON.stringify(videoData), this.videoTTL);
      return true;
    } catch (error) {
      Logger.error(`Video cache set error: ${mediaUrl}`, error);
      return false;
    }
  }

  // Generate optimized video URL with cache buster
  getOptimizedVideoUrl(originalUrl, quality = "medium") {
    if (!originalUrl) return null;

    // Return cached version URL if available
    const cacheKey = this.getVideoCacheKey(originalUrl, quality);
    const cacheBuster = Date.now();

    // Create proxy URL that serves cached or optimized video
    return `/api/videos/stream/${encodeURIComponent(originalUrl)}?quality=${quality}&cb=${cacheBuster}`;
  }

  // Clean old video cache files
  async cleanOldCache() {
    try {
      const files = fs.readdirSync(this.videoCacheDir);
      let cleanedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.videoCacheDir, file);
        const stats = fs.statSync(filePath);

        if (Date.now() - stats.mtimeMs > this.cacheMaxAge) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        Logger.info(`Cleaned ${cleanedCount} old video cache files`);
      }

      return cleanedCount;
    } catch (error) {
      Logger.error("Error cleaning video cache:", error);
      return 0;
    }
  }
}

const videoCacheManager = new VideoCacheManager();

// ============================================
// STORY EXPIRATION RULES
// ============================================
const getExpirationHours = (boostPoints, totalBoostAmount) => {
  // STRICT 24 HOUR LIMIT (WhatsApp Style)
  // We ignore boosts for longevity to keep stories fresh and ephemeral
  return 24;
};

const isStoryExpired = (createdAt, boostPoints, totalBoostAmount) => {
  if (!createdAt) return true;
  const expirationHours = getExpirationHours(boostPoints, totalBoostAmount);
  const expirationTime = new Date(createdAt);
  expirationTime.setHours(expirationTime.getHours() + expirationHours);
  return new Date() > expirationTime;
};

// ============================================
// CACHE MANAGER - FULLY SAFE
// ============================================
class CacheManager {
  constructor() {
    this.defaultTTL = 300;
  }

  async get(key) {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      if (!data) return null;
      // If data is already an object, return it, otherwise parse
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      Logger.error(`Cache get error: ${key}`, error);
      return null;
    }
  }

  async set(key, data, ttl = this.defaultTTL) {
    if (!redis) return false;
    try {
      const stringified = typeof data === 'string' ? data : JSON.stringify(data);
      await redis.set(key, stringified, ttl);
      return true;
    } catch (error) {
      Logger.error(`Cache set error: ${key}`, error);
      return false;
    }
  }

  async del(key) {
    if (!redis) return false;
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      Logger.error(`Cache delete error: ${key}`, error);
      return false;
    }
  }

  // Safe pattern deleter – works with any Redis client, never crashes
  async delPattern(pattern) {
    if (!redis) return 0;
    try {
      let deletedCount = 0;

      // Try SCAN (ioredis style)
      if (typeof redis.scan === 'function') {
        let cursor = '0';
        do {
          const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
          cursor = result[0];
          const keys = result[1];
          if (keys && keys.length) {
            await redis.del(...keys);
            deletedCount += keys.length;
          }
        } while (cursor !== '0');
      }
      // Try KEYS (node-redis style)
      else if (typeof redis.keys === 'function') {
        const keys = await redis.keys(pattern);
        if (keys && keys.length) {
          await redis.del(...keys);
          deletedCount = keys.length;
        }
      }
      // Try sendCommand as last resort
      else if (typeof redis.sendCommand === 'function') {
        const keys = await redis.sendCommand('KEYS', [pattern]);
        if (keys && keys.length) {
          await redis.sendCommand('DEL', keys);
          deletedCount = keys.length;
        }
      }

      if (deletedCount) Logger.info(`Cleared ${deletedCount} cache keys matching: ${pattern}`);
      return deletedCount;
    } catch (error) {
      Logger.error(`Cache pattern delete error: ${pattern}`, error);
      return 0;
    }
  }

  async clearLeaderCache(leaderId) {
    if (!redis || !leaderId) return 0;
    const patterns = [
      `leader:${leaderId}:recent_endorsements:*`,
      `leader:${leaderId}:active_stories:*`,
      `leader:${leaderId}:boosted_endorsements:*`,
      `leader:${leaderId}:trending_endorsements:*`,
      `leader:${leaderId}:endorsement_stats`,
    ];

    let totalCleared = 0;
    for (const pattern of patterns) {
      totalCleared += await this.delPattern(pattern);
    }
    await this.delPattern("global:trending_endorsements:*");
    await this.delPattern("global:trending:*");
    Logger.info(`✅ Cleared ${totalCleared} cache entries for leader: ${leaderId}`);
    return totalCleared;
  }

  async getOrSet(key, fetcher, ttl = this.defaultTTL) {
    try {
      const cached = await this.get(key);
      if (cached !== null) return cached;
      const fresh = await fetcher();
      if (fresh !== undefined && fresh !== null) {
        await this.set(key, fresh, ttl);
      }
      return fresh;
    } catch (error) {
      Logger.error(`Cache getOrSet error: ${key}`, error);
      // Fallback: try fetcher directly without caching
      try {
        return await fetcher();
      } catch (fallbackError) {
        Logger.error(`Fallback fetcher also failed: ${key}`, fallbackError);
        return null;
      }
    }
  }
}

const cacheManager = new CacheManager();

// ============================================
// Optimized Video Processing Middleware
// ============================================
const optimizeVideoDelivery = asyncHandler(async (req, res, next) => {
  const originalUrl = req.query.url || req.body.video_url;

  if (!originalUrl) {
    return next();
  }

  try {
    // Check if video is already cached
    const quality = req.query.quality || "medium";
    const cachedVideo = await videoCacheManager.getCachedVideo(originalUrl, quality);

    if (cachedVideo) {
      // Serve from cache
      req.cachedVideoUrl = cachedVideo.cachePath;
      req.videoOptimized = true;
      return next();
    }

    // For videos, we'll serve optimized streaming URL
    req.optimizedVideoUrl = videoCacheManager.getOptimizedVideoUrl(originalUrl, quality);
    next();
  } catch (error) {
    Logger.error("Video optimization error:", error);
    next(); // Don't break if video optimization fails
  }
});

// ============================================
// CREATE ENDORSEMENT - COMPLETELY FREE (WITH VIDEO OPTIMIZATION)
// ============================================

const createEndorsement = [
  uploadEndorsementMedia,
  optimizeVideoDelivery, // Add video optimization middleware
  asyncHandler(async (req, res) => {
    let { leader_id, message, user_id, user_name } = req.body;

    const authenticatedUserId = req.user?.user_id;
    const authenticatedUserName = req.user?.name;

    const finalUserId = authenticatedUserId || user_id;
    const finalUserName = authenticatedUserName || user_name || "Anonymous";

    let mediaType = "text";
    let mediaUrl = null;
    let userMessage = message || "";

    // Handle media from middleware or fallback
    if (req.fileProcessed && req.mediaUrl) {
      mediaUrl = req.mediaUrl;
      mediaType = req.mediaType || "image";

      // Optimize video URLs
      if (mediaType === "video" && mediaUrl) {
        mediaUrl = videoCacheManager.getOptimizedVideoUrl(mediaUrl, "medium");
      }

      Logger.info(`📸 Media uploaded via middleware: ${mediaType} - ${mediaUrl}`);
    } else if (req.file && !req.mediaUrl) {
      Logger.warn("⚠️ Middleware didn't set mediaUrl, using fallback");
      const file = req.file;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const fileName = `${Date.now()}_${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname)}`;
      mediaUrl = `/uploads/endorsements/${year}/${month}/${fileName}`;
      mediaType = file.mimetype.startsWith("video/") ? "video" : "image";

      const uploadDir = path.join(__dirname, "../../../uploads/endorsements", String(year), month);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadDir, fileName), file.buffer);

      // Optimize video URLs
      if (mediaType === "video") {
        mediaUrl = videoCacheManager.getOptimizedVideoUrl(mediaUrl, "medium");
      }

      Logger.info(`📸 Fallback - Media saved: ${mediaUrl}`);
    }

    if (!leader_id || !finalUserId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
      // Daily limit check - set to 20 as requested
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const dailyCount = await safeQuery(
        `SELECT COUNT(*) as count FROM endorsements WHERE user_id = ? AND created_at >= ? AND status = 'active'`,
        [finalUserId, todayStart]
      );
      const endorsementsToday = dailyCount[0]?.count || 0;
      if (endorsementsToday >= 20) {
        return res.status(429).json({
          success: false,
          message: `Daily limit reached. You can only make 20 endorsement stories per day.`
        });
      }

      // Verify leader exists
      const leader = await safeQueryOne(`SELECT leader_id, name FROM leaders WHERE leader_id = ?`, [leader_id]);
      if (!leader) {
        return res.status(404).json({ success: false, message: "Leader not found" });
      }

      // Build final message
      let finalMessage = userMessage;
      if (mediaType === "image" && (!finalMessage || !finalMessage.trim())) finalMessage = "📷 Photo";
      if (mediaType === "video" && (!finalMessage || !finalMessage.trim())) finalMessage = "🎥 Video";
      if (mediaType === "text" && (!finalMessage || !finalMessage.trim())) finalMessage = "💬 Support message";
      finalMessage = finalMessage.trim();

      // Insert endorsement (free)
      const insertResult = await safeQuery(
        `INSERT INTO endorsements (
          leader_id, user_id, user_name, amount, phrase, message, 
          image_url, thumbnail_url, media_type, post_type, level, 
          status, created_at, boost_count, total_boost_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'bronze', 'active', NOW(), 0, 0)`,
        [leader_id, finalUserId, finalUserName, 0, finalMessage.slice(0, 50), finalMessage, mediaUrl, null, mediaType, mediaType === "text" ? "text" : mediaType]
      );

      // Update leader endorsement count
      await safeQuery(`UPDATE leaders SET endorsement_count = COALESCE(endorsement_count, 0) + 1 WHERE leader_id = ?`, [leader_id]);

      // Retrieve created endorsement
      const result = await safeQueryOne(`SELECT * FROM endorsements WHERE id = ?`, [insertResult.insertId]);

      // Clear cache (non-blocking)
      try {
        await cacheManager.clearLeaderCache(leader_id);
      } catch (cacheError) {
        Logger.warn("Cache clear failed but endorsement was created:", cacheError.message);
      }

      return res.status(201).json({
        success: true,
        message: "Story posted successfully! (Free - No charges)",
        data: {
          ...result,
          image_url: mediaUrl,
          media_type: mediaType,
          amount: 0,
          isFree: true,
          videoOptimized: mediaType === "video"
        },
      });
    } catch (error) {
      Logger.error("Error creating story:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to post story"
      });
    }
  }),
];

// ============================================
// Video Stream Endpoint (serves optimized video)
// ============================================
const streamVideo = asyncHandler(async (req, res) => {
  const { videoUrl } = req.params;
  const quality = req.query.quality || "medium";

  if (!videoUrl) {
    return res.status(400).json({ success: false, message: "Video URL required" });
  }

  try {
    const decodedUrl = decodeURIComponent(videoUrl);
    const fullPath = path.join(__dirname, "../../..", decodedUrl);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Handle range requests for video streaming
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(fullPath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      };

      res.writeHead(200, head);
      fs.createReadStream(fullPath).pipe(res);
    }

    // Cache video metadata in background (non-blocking)
    const cacheKey = videoCacheManager.getVideoCacheKey(decodedUrl, quality);
    const videoData = {
      cachePath: fullPath,
      fileSize,
      quality,
      cachedAt: new Date().toISOString()
    };

    videoCacheManager.setCachedVideo(decodedUrl, videoData, quality).catch(err => {
      Logger.warn("Failed to cache video metadata:", err);
    });

  } catch (error) {
    Logger.error("Video streaming error:", error);
    return res.status(500).json({ success: false, message: "Error streaming video" });
  }
});

// ============================================
// GET RECENT ENDORSEMENTS (with video optimization)
// ============================================
const getRecentEndorsements = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 100, 200);
  const cacheKey = leaderId ? `leader:${leaderId}:recent_endorsements:${limit}` : `global:recent_endorsements:${limit}`;

  try {
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      // Optimize video URLs in cached response
      if (cached && Array.isArray(cached)) {
        cached.forEach(item => {
          if (item.media_type === "video" && item.image_url) {
            item.image_url = videoCacheManager.getOptimizedVideoUrl(item.image_url, "medium");
          }
        });
      }
      return res.status(200).json({ success: true, data: cached, source: "cache" });
    }

    let queryStr = `
       SELECT id, leader_id, user_id, user_name, amount, phrase, message, image_url, thumbnail_url,
              media_type, post_type, level, likes, views, shares, comments, 
              boost_count, total_boost_amount, created_at, status
       FROM endorsements 
       WHERE status = 'active'
         AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR)
    `;
    let queryParams = [];

    if (leaderId) {
      queryStr += ` AND leader_id = ? `;
      queryParams.push(leaderId);
    }

    queryStr += ` ORDER BY created_at DESC LIMIT ? `;
    queryParams.push(limit);

    const endorsements = await safeQuery(queryStr, queryParams);
    const safeEndorsements = Array.isArray(endorsements) ? endorsements : [];

    const processedEndorsements = safeEndorsements.map((e) => ({
      id: e.id,
      user_id: e.user_id,
      user_name: e.user_name,
      message: e.message || "",
      media_type: e.media_type || "text",
      image_url: e.media_type === "video" && e.image_url
        ? videoCacheManager.getOptimizedVideoUrl(e.image_url, "medium")
        : e.image_url,
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
      videoOptimized: e.media_type === "video"
    }));

    await cacheManager.set(cacheKey, processedEndorsements, 60);
    return res.status(200).json({ success: true, data: processedEndorsements, source: "database", count: processedEndorsements.length });
  } catch (error) {
    Logger.error("Error fetching recent endorsements:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ============================================
// GET ACTIVE STORIES (with video optimization)
// ============================================
const getActiveStories = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 100, 200);
  const cacheKey = `leader:${leaderId}:active_stories:${limit}`;

  const data = await cacheManager.getOrSet(cacheKey, async () => {
    // Strictly filter for stories from the last 24 hours
    const endorsements = await safeQuery(
      `SELECT id, user_id, user_name, amount, phrase, message, image_url, thumbnail_url,
              media_type, post_type, level, likes, views, shares, comments, 
              boost_count, total_boost_amount, created_at
       FROM endorsements 
       WHERE leader_id = ? AND status = 'active'
         AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR)
       ORDER BY created_at DESC
       LIMIT ?`,
      [leaderId, limit]
    );
    const safeEndorsements = Array.isArray(endorsements) ? endorsements : [];
    const activeStories = safeEndorsements.filter(
      (story) => !isStoryExpired(story.created_at, story.boost_count, story.total_boost_amount)
    );
    return activeStories.map((e) => ({
      ...e,
      image_url: e.media_type === "video" && e.image_url
        ? videoCacheManager.getOptimizedVideoUrl(e.image_url, "medium")
        : e.image_url,
      isFree: parseInt(e.amount) === 0,
      type: parseInt(e.amount) === 0 ? "free" : "paid",
      expiresIn: getExpirationHours(e.boost_count, e.total_boost_amount),
      videoOptimized: e.media_type === "video"
    }));
  }, 60);

  return res.status(200).json({ success: true, data: data || [], total: data?.length || 0 });
});

// ============================================
// GET BOOSTED ENDORSEMENTS (with video optimization)
// ============================================
const getBoostedEndorsements = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const cacheKey = `leader:${leaderId}:boosted_endorsements:${limit}`;

  const data = await cacheManager.getOrSet(cacheKey, async () => {
    let endorsements = await safeQuery(
      `SELECT id, user_id, user_name, amount, phrase, message, image_url, thumbnail_url,
              media_type, post_type, level, likes, views, shares, comments,
              boost_count, total_boost_amount, created_at
       FROM endorsements 
       WHERE leader_id = ? AND status = 'active' AND (boost_count > 0 OR total_boost_amount > 0)
         AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR)
       ORDER BY total_boost_amount DESC, boost_count DESC, created_at DESC
       LIMIT ?`,
      [leaderId, limit]
    );

    if (!endorsements || endorsements.length === 0) {
      Logger.info(`No boosted endorsements found for leader ${leaderId}, fetching most recent...`);
      endorsements = await safeQuery(
        `SELECT id, user_id, user_name, amount, phrase, message, image_url, thumbnail_url,
                media_type, post_type, level, likes, views, shares, comments,
                boost_count, total_boost_amount, created_at
         FROM endorsements 
         WHERE leader_id = ? AND status = 'active'
           AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR)
         ORDER BY created_at DESC
         LIMIT ?`,
        [leaderId, limit]
      );
    }

    const safeEndorsements = Array.isArray(endorsements) ? endorsements : [];
    return safeEndorsements.map((e) => ({
      ...e,
      image_url: e.media_type === "video" && e.image_url
        ? videoCacheManager.getOptimizedVideoUrl(e.image_url, "medium")
        : e.image_url,
      isFree: parseInt(e.amount) === 0,
      type: parseInt(e.amount) === 0 ? "free" : "paid",
      expiresIn: getExpirationHours(e.boost_count, e.total_boost_amount),
      isBoosted: (e.boost_count > 0 || e.total_boost_amount > 0),
      videoOptimized: e.media_type === "video"
    }));
  }, 300);

  return res.status(200).json({
    success: true,
    data: data || [],
    count: data?.length || 0,
    source: data?.length > 0 && data[0]?.isBoosted ? "boosted" : "recent"
  });
});

// ============================================
// GET TRENDING ENDORSEMENTS (with video optimization)
// ============================================
const getTrendingEndorsements = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const days = parseInt(req.query.days) || 7;
  const cacheKey = `leader:${leaderId}:trending_endorsements:${limit}:days:${days}`;

  const data = await cacheManager.getOrSet(cacheKey, async () => {
    let endorsements = await safeQuery(
      `SELECT id, user_id, user_name, amount, phrase, message, image_url, thumbnail_url,
              media_type, post_type, level, likes, views, shares, comments,
              boost_count, total_boost_amount, created_at,
              (likes + views + shares + comments + COALESCE(boost_count, 0) * 5) as trending_score
       FROM endorsements 
       WHERE leader_id = ? AND status = 'active'
         AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR)
       ORDER BY trending_score DESC, created_at DESC
       LIMIT ?`,
      [leaderId, limit]
    );

    if (!endorsements || endorsements.length === 0) {
      Logger.info(`No trending endorsements found for leader ${leaderId}, fetching most recent...`);
      endorsements = await safeQuery(
        `SELECT id, user_id, user_name, amount, phrase, message, image_url, thumbnail_url,
                media_type, post_type, level, likes, views, shares, comments,
                boost_count, total_boost_amount, created_at,
                0 as trending_score
         FROM endorsements 
         WHERE leader_id = ? AND status = 'active'
           AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR)
         ORDER BY created_at DESC
         LIMIT ?`,
        [leaderId, limit]
      );
    }

    const safeEndorsements = Array.isArray(endorsements) ? endorsements : [];
    return safeEndorsements.map((e) => ({
      id: e.id,
      user_id: e.user_id,
      user_name: e.user_name,
      message: e.message || "",
      media_type: e.media_type || "text",
      image_url: e.media_type === "video" && e.image_url
        ? videoCacheManager.getOptimizedVideoUrl(e.image_url, "medium")
        : e.image_url,
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
      trending_score: e.trending_score || 0,
      isFree: parseInt(e.amount) === 0,
      type: parseInt(e.amount) === 0 ? "free" : "paid",
      videoOptimized: e.media_type === "video"
    }));
  }, 180);

  return res.status(200).json({
    success: true,
    data: data || [],
    count: data?.length || 0,
    source: data?.length > 0 ? (data[0]?.trending_score > 0 ? "trending" : "recent") : "none"
  });
});

// ============================================
// LIKE ENDORSEMENT
// ============================================
const likeEndorsement = asyncHandler(async (req, res) => {
  const { endorsementId } = req.params;
  const { user_id } = req.body;
  const finalUserId = req.user?.user_id || user_id;

  if (!endorsementId || !finalUserId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const endorsement = await safeQueryOne(
      `SELECT id, leader_id, likes FROM endorsements WHERE id = ?`,
      [endorsementId]
    );
    if (!endorsement) {
      return res.status(404).json({ success: false, message: "Endorsement not found" });
    }

    const leaderId = endorsement.leader_id;
    let liked = false;
    let likesCount = endorsement.likes || 0;

    const existingLike = await safeQueryOne(
      `SELECT id FROM endorsement_likes WHERE endorsement_id = ? AND user_id = ?`,
      [endorsementId, finalUserId]
    );

    if (existingLike) {
      await safeQuery(`DELETE FROM endorsement_likes WHERE endorsement_id = ? AND user_id = ?`, [endorsementId, finalUserId]);
      await safeQuery(`UPDATE endorsements SET likes = GREATEST(likes - 1, 0) WHERE id = ?`, [endorsementId]);
      liked = false;
      likesCount = Math.max((endorsement.likes || 0) - 1, 0);
    } else {
      await safeQuery(`INSERT INTO endorsement_likes (endorsement_id, user_id, created_at) VALUES (?, ?, NOW())`, [endorsementId, finalUserId]);
      await safeQuery(`UPDATE endorsements SET likes = likes + 1 WHERE id = ?`, [endorsementId]);
      liked = true;
      likesCount = (endorsement.likes || 0) + 1;
    }

    // Non-blocking cache clear
    try {
      await cacheManager.clearLeaderCache(leaderId);
    } catch (cacheError) {
      Logger.warn("Cache clear failed:", cacheError.message);
    }

    return res.status(200).json({
      success: true,
      message: liked ? "Endorsement liked" : "Endorsement unliked",
      likes: likesCount,
      liked,
    });
  } catch (error) {
    Logger.error("Error liking endorsement:", error.message);
    return res.status(500).json({ success: false, message: error.message || "Failed to like endorsement" });
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
  const allowedAmounts = [10, 50, 100, 500];

  if (!endorsementId || !finalUserId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }
  if (!allowedAmounts.includes(boostAmount)) {
    return res.status(400).json({ success: false, message: "Invalid boost amount. Allowed: 10, 50, 100, 500 KES" });
  }

  try {
    const endorsement = await safeQueryOne(
      `SELECT id, leader_id, amount, boost_count, total_boost_amount FROM endorsements WHERE id = ?`,
      [endorsementId]
    );
    if (!endorsement) {
      return res.status(404).json({ success: false, message: "Endorsement not found" });
    }

    const leaderId = endorsement.leader_id;

    const wallet = await safeQueryOne(`SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE`, [finalUserId]);
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }

    const currentBalance = parseFloat(wallet.balance) || 0;
    if (currentBalance < boostAmount) {
      return res.status(400).json({ success: false, message: `Insufficient balance. Need KES ${boostAmount}, have KES ${currentBalance}` });
    }

    await safeQuery(`UPDATE user_wallets SET balance = balance - ?, updated_at = NOW() WHERE user_id = ?`, [boostAmount, finalUserId]);

    await safeQuery(
      `INSERT INTO endorsement_boosts (endorsement_id, user_id, amount, created_at) VALUES (?, ?, ?, NOW())`,
      [endorsementId, finalUserId, boostAmount]
    );

    await safeQuery(
      `UPDATE endorsements SET boost_count = COALESCE(boost_count, 0) + 1, total_boost_amount = COALESCE(total_boost_amount, 0) + ?, updated_at = NOW() WHERE id = ?`,
      [boostAmount, endorsementId]
    );

    try {
      await cacheManager.clearLeaderCache(leaderId);
      await cacheManager.delPattern("global:trending:*");
    } catch (cacheError) {
      Logger.warn("Cache clear failed:", cacheError.message);
    }

    const updatedWallet = await safeQueryOne(`SELECT balance FROM user_wallets WHERE user_id = ?`, [finalUserId]);
    const newExpiration = getExpirationHours(
      (endorsement.boost_count || 0) + 1,
      (endorsement.total_boost_amount || 0) + boostAmount
    );

    return res.status(200).json({
      success: true,
      message: `Endorsement boosted with KES ${boostAmount}!`,
      data: {
        endorsement_id: endorsementId,
        amount: boostAmount,
        new_balance: updatedWallet?.balance || 0,
        boost_count: (endorsement.boost_count || 0) + 1,
        expiresIn: newExpiration,
      },
    });
  } catch (error) {
    Logger.error("Error boosting endorsement:", error.message);
    return res.status(500).json({ success: false, message: error.message || "Failed to boost endorsement" });
  }
});

// ============================================
// ADD COMMENT (with table creation safety)
// ============================================
const addComment = asyncHandler(async (req, res) => {
  const { endorsementId } = req.params;
  const { comment, user_id, user_name, user_avatar } = req.body;
  const authenticatedUserId = req.user?.user_id;
  const authenticatedUserName = req.user?.name;

  const finalUserId = authenticatedUserId || user_id;
  const finalUserName = authenticatedUserName || user_name || "Anonymous";

  if (!endorsementId || !comment || !finalUserId) {
    return res.status(400).json({ success: false, message: "Missing: endorsementId, comment, user_id" });
  }

  try {
    try {
      const dbCheck = await safeQueryOne(`SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'endorsement_comments'`);
      if (!dbCheck || dbCheck.cnt === 0) {
        return res.status(503).json({ success: false, message: "Comments feature is temporarily unavailable while database upgrades apply" });
      }
    } catch (err) { }


    const endorsement = await safeQueryOne(`SELECT id, leader_id FROM endorsements WHERE id = ?`, [endorsementId]);
    if (!endorsement) {
      return res.status(404).json({ success: false, message: "Endorsement not found" });
    }

    const insertResult = await safeQuery(
      `INSERT INTO endorsement_comments (endorsement_id, user_id, user_name, user_avatar, comment, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [endorsementId, finalUserId, finalUserName, user_avatar || null, comment]
    );

    await safeQuery(`UPDATE endorsements SET comments = comments + 1 WHERE id = ?`, [endorsementId]);

    const newComment = await safeQueryOne(
      `SELECT id, user_id, user_name, user_avatar, comment, likes, created_at 
       FROM endorsement_comments WHERE id = ?`,
      [insertResult.insertId]
    );

    await cacheManager.delPattern(`endorsement:${endorsementId}:comments:*`);

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    Logger.error("Error adding comment:", error.message);
    return res.status(500).json({ success: false, message: error.message || "Failed to add comment" });
  }
});

// ============================================
// GET COMMENTS
// ============================================
const getComments = asyncHandler(async (req, res) => {
  const { endorsementId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = parseInt(req.query.offset) || 0;
  const cacheKey = `endorsement:${endorsementId}:comments:limit:${limit}:offset:${offset}`;

  try {
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, source: "cache", data: cached });
    }

    const comments = await safeQuery(
      `SELECT id, user_id, user_name, user_avatar, comment, likes, created_at
       FROM endorsement_comments 
       WHERE endorsement_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [endorsementId, limit, offset]
    );

    const countResult = await safeQueryOne(`SELECT COUNT(*) as total FROM endorsement_comments WHERE endorsement_id = ?`, [endorsementId]);

    const response = {
      comments: Array.isArray(comments) ? comments : [],
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset,
      },
    };

    await cacheManager.set(cacheKey, response, 60);
    return res.status(200).json({ success: true, source: "database", data: response });
  } catch (error) {
    Logger.error("Error fetching comments:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch comments" });
  }
});

// ============================================
// LIKE COMMENT
// ============================================
const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { user_id } = req.body;
  const authenticatedUserId = req.user?.user_id;
  const finalUserId = authenticatedUserId || user_id;

  if (!commentId || !finalUserId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    try {
      const dbCheck = await safeQueryOne(`SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'comment_likes'`);
      if (!dbCheck || dbCheck.cnt === 0) {
        return res.status(503).json({ success: false, message: "Comment likes feature is temporarily unavailable" });
      }
    } catch (err) { }


    const comment = await safeQueryOne(`SELECT id, likes FROM endorsement_comments WHERE id = ?`, [commentId]);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    let liked = false;
    let likesCount = comment.likes || 0;

    const existingLike = await safeQueryOne(`SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?`, [commentId, finalUserId]);

    if (existingLike) {
      await safeQuery(`DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?`, [commentId, finalUserId]);
      await safeQuery(`UPDATE endorsement_comments SET likes = GREATEST(likes - 1, 0) WHERE id = ?`, [commentId]);
      liked = false;
      likesCount = Math.max((comment.likes || 0) - 1, 0);
    } else {
      await safeQuery(`INSERT INTO comment_likes (comment_id, user_id, created_at) VALUES (?, ?, NOW())`, [commentId, finalUserId]);
      await safeQuery(`UPDATE endorsement_comments SET likes = likes + 1 WHERE id = ?`, [commentId]);
      liked = true;
      likesCount = (comment.likes || 0) + 1;
    }

    await cacheManager.delPattern(`endorsement:*:comments:*`);

    return res.status(200).json({
      success: true,
      message: liked ? "Comment liked" : "Comment unliked",
      likes: likesCount,
      liked,
    });
  } catch (error) {
    Logger.error("Error liking comment:", error);
    return res.status(500).json({ success: false, message: "Failed to like comment" });
  }
});

// ============================================
// GET ENDORSEMENT STATS
// ============================================
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
      [endorsementId]
    );

    return res.status(200).json({ success: true, data: stats || {} });
  } catch (error) {
    Logger.error("Error fetching endorsement stats:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

// ============================================
// GET LEADER ENDORSEMENT STATS
// ============================================
const getLeaderEndorsementStats = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const cacheKey = `leader:${leaderId}:endorsement_stats`;

  const stats = await cacheManager.getOrSet(cacheKey, async () => {
    const result = await safeQueryOne(
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
      [leaderId]
    );
    return result || {
      total_endorsements: 0,
      unique_supporters: 0,
      free_endorsements: 0,
      paid_endorsements: 0,
      total_likes: 0,
      total_comments: 0,
      total_boosts: 0,
      total_boost_amount: 0
    };
  }, 3600);

  return res.status(200).json({ success: true, data: stats });
});

// ============================================
// ADMIN: GET GLOBAL STATS
// ============================================
const getEndorsementAdminStats = asyncHandler(async (req, res) => {
  const cacheKey = "admin:endorsement_stats";

  const stats = await cacheManager.getOrSet(cacheKey, async () => {
    const totals = await safeQueryOne(`
      SELECT 
        COUNT(*) as total_endorsements,
        SUM(boost_count) as total_boosts,
        SUM(total_boost_amount) as total_revenue,
        COUNT(DISTINCT user_id) as total_supporters
      FROM endorsements
      WHERE status = 'active'
    `) || { total_endorsements: 0, total_boosts: 0, total_revenue: 0, total_supporters: 0 };

    const countyDistribution = await safeQuery(`
      SELECT l.county, COUNT(e.id) as count
      FROM endorsements e
      JOIN leaders l ON e.leader_id = l.leader_id
      WHERE e.status = 'active'
      GROUP BY l.county
      ORDER BY count DESC
    `) || [];

    const topLeaders = await safeQuery(`
      SELECT l.name, l.county, COUNT(e.id) as count
      FROM endorsements e
      JOIN leaders l ON e.leader_id = l.leader_id
      WHERE e.status = 'active'
      GROUP BY l.leader_id, l.name, l.county
      ORDER BY count DESC
      LIMIT 10
    `) || [];

    return { totals, countyDistribution, topLeaders };
  }, 300);

  return res.status(200).json({ success: true, data: stats });
});

// ============================================
// CLEANUP EXPIRED STORIES (background job)
// ============================================
const cleanupExpiredStories = async () => {
  try {
    const endorsements = await safeQuery(`SELECT id, created_at, boost_count, total_boost_amount FROM endorsements WHERE status = 'active'`);
    if (!Array.isArray(endorsements)) return;

    let expiredCount = 0;
    for (const endorsement of endorsements) {
      if (isStoryExpired(endorsement.created_at, endorsement.boost_count, endorsement.total_boost_amount)) {
        await safeQuery(`UPDATE endorsements SET status = 'expired' WHERE id = ?`, [endorsement.id]);
        expiredCount++;
      }
    }
    if (expiredCount > 0) Logger.info(`Cleaned up ${expiredCount} expired stories`);

    // Also clean video cache periodically
    await videoCacheManager.cleanOldCache();
  } catch (error) {
    Logger.error("Cleanup expired stories error:", error);
  }
};

// ============================================
// EXPORTS (all functions present)
// ============================================
module.exports = {
  createEndorsement,
  getActiveStories,
  getRecentEndorsements,
  getBoostedEndorsements,
  getTrendingEndorsements,
  likeEndorsement,
  boostEndorsement,
  getLeaderEndorsementStats,
  getEndorsementAdminStats,
  cleanupExpiredStories,
  addComment,
  getComments,
  likeComment,
  getEndorsementStats,
  streamVideo, // Export video streaming endpoint
  optimizeVideoDelivery,
};