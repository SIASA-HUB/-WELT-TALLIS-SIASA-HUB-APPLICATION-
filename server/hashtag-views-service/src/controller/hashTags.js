const asyncHandler = require('express-async-handler');
const Logger = require('../utils/logger/logger');
const { safeQuery, safeQueryOne } = require('../configurations/db');
const { getKenyaTimeISO } = require('../utils/timestamps/timestamps');

const { 
  hashtagPublisher, 
  viewPublisher, 
  likePublisher 
} = require('./rabbitmq/publishers');

// Rate limiting cache (in-memory, consider Redis for production)
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window

/**
 * Rate limiting middleware
 */
function checkRateLimit(key, action) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitCache.has(key)) {
    rateLimitCache.set(key, []);
  }
  
  const requests = rateLimitCache.get(key);
  // Clean old requests
  while (requests.length && requests[0] < windowStart) {
    requests.shift();
  }
  
  if (requests.length >= RATE_LIMIT_MAX) {
    Logger.warn(`Rate limit exceeded for ${action}: ${key}`);
    return false;
  }
  
  requests.push(now);
  // Auto-clean old entries periodically
  if (Math.random() < 0.01) { // 1% chance on each request
    for (const [cacheKey, cacheRequests] of rateLimitCache.entries()) {
      if (cacheRequests.every(time => time < windowStart)) {
        rateLimitCache.delete(cacheKey);
      }
    }
  }
  
  return true;
}

/**
 * Helper function to normalize video ID (removes backup_videos/ prefix if present)
 */
function normalizeVideoId(videoId) {
  if (!videoId) return videoId;
  
  // Remove backup_videos/ prefix if present
  if (videoId.startsWith('backup_videos/')) {
    return videoId.replace('backup_videos/', '');
  }
  
  return videoId;
}

/**
 * Helper to find video by ID (supports both integer ID and public_id)
 */
async function findVideoById(videoId) {
  const normalizedVideoId = normalizeVideoId(videoId);
  let video;
  
  // Check if video_id is a number (integer ID)
  if (!isNaN(normalizedVideoId) && normalizedVideoId.toString().match(/^\d+$/)) {
    video = await safeQueryOne(
      'SELECT id, public_id, views, likes FROM backup_videos WHERE id = ?',
      [parseInt(normalizedVideoId)]
    );
    
    if (video) {
      Logger.info(`Found by integer ID: ${normalizedVideoId}`);
      return video;
    }
  }
  
  // If not found by integer ID, try by public_id with backup_videos/ prefix
  // Try with backup_videos/ prefix
  const prefixedId = normalizedVideoId.startsWith('backup_videos/') 
    ? normalizedVideoId 
    : `backup_videos/${normalizedVideoId}`;
  
  video = await safeQueryOne(
    'SELECT id, public_id, views, likes FROM backup_videos WHERE public_id = ?',
    [prefixedId]
  );
  
  if (video) {
    Logger.info(`Found by prefixed public_id: ${prefixedId}`);
    return video;
  }
  
  // If still not found, try without the prefix
  video = await safeQueryOne(
    'SELECT id, public_id, views, likes FROM backup_videos WHERE public_id = ?',
    [normalizedVideoId]
  );
  
  if (video) {
    Logger.info(`Found by public_id: ${normalizedVideoId}`);
    return video;
  }
  
  return null;
}

/**
 * Helper to update video views in database
 */
async function updateVideoViews(videoId, user_id = null) {
  try {
    const video = await findVideoById(videoId);
    if (!video) {
      Logger.warn(`[Update Views] Video not found: ${videoId}`);
      return false;
    }
    
    // Update views in database immediately
    await safeQuery(
      'UPDATE backup_videos SET views = views + 1 WHERE id = ?',
      [video.id]
    );
    
    Logger.info(`[Update Views] View recorded in database for video ID: ${video.id} (public_id: ${video.public_id})`);
    return true;
  } catch (error) {
    Logger.error(`[Update Views ERROR] Failed to update views for ${videoId}:`, error.message);
    return false;
  }
}

/**
 * Helper to update video likes in database
 */
async function updateVideoLikes(videoId, action = 'like', user_id = null) {
  try {
    const video = await findVideoById(videoId);
    if (!video) {
      Logger.warn(`[Update Likes] Video not found: ${videoId}`);
      return false;
    }
    
    // Update likes in database immediately
    if (action === 'like') {
      await safeQuery(
        'UPDATE backup_videos SET likes = likes + 1 WHERE id = ?',
        [video.id]
      );
      Logger.info(`[Update Likes] Like added in database for video ID: ${video.id}`);
    } else if (action === 'unlike') {
      await safeQuery(
        'UPDATE backup_videos SET likes = GREATEST(likes - 1, 0) WHERE id = ?',
        [video.id]
      );
      Logger.info(`[Update Likes] Unlike recorded in database for video ID: ${video.id}`);
    }
    
    return true;
  } catch (error) {
    Logger.error(`[Update Likes ERROR] Failed to update likes for ${videoId}:`, error.message);
    return false;
  }
}

/**
 * CREATE HASHTAG
 */
const createHashTagToPost = asyncHandler(async (req, res) => {
  const { post_id, hashtag, user_id } = req.body;
  const created_at = getKenyaTimeISO();

  if (!post_id || !hashtag) {
    Logger.warn('[Create Hashtag] Missing post_id or hashtag');
    return res.status(400).json({ success: false, message: 'post_id and hashtag are required' });
  }

  // Rate limiting
  const rateLimitKey = `hashtag:${user_id || req.ip}:${post_id}`;
  if (!checkRateLimit(rateLimitKey, 'hashtag')) {
    return res.status(429).json({ 
      success: false, 
      message: 'Too many hashtag requests. Please try again later.' 
    });
  }

  try {
    // Quick validation - check if post exists
    const postExists = await safeQueryOne(
      'SELECT 1 FROM posts WHERE post_id = ? LIMIT 1',
      [post_id]
    );

    if (!postExists) {
      Logger.warn(`[Create Hashtag] Post not found: post_id=${post_id}`);
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Format hashtag
    const formattedHashtag = hashtag.startsWith('#') 
      ? hashtag.toLowerCase() 
      : `#${hashtag.toLowerCase()}`;

    // Publish via RabbitMQ (async - don't wait)
    const publishResult = await hashtagPublisher.publishHashtagEvent(
      post_id, 
      formattedHashtag, 
      user_id
    );

    if (!publishResult) {
      Logger.warn('[Create Hashtag] RabbitMQ publishing failed, using fallback');
      // Fallback - insert directly
      const result = await safeQuery(
        'INSERT INTO post_hashtags (post_id, hashtag, user_id, created_at) VALUES (?, ?, ?, ?)',
        [post_id, formattedHashtag, user_id || null, created_at || null]
      );
    }

    Logger.info(`[Create Hashtag] Hashtag queued: ${formattedHashtag} for post ${post_id}`);

    return res.status(202).json({ // 202 Accepted
      success: true,
      message: 'Hashtag request accepted and queued for processing',
      data: {
        post_id,
        hashtag: formattedHashtag,
        queued: true,
        timestamp: created_at
      }
    });

  } catch (error) {
    Logger.error('[Create Hashtag ERROR]', {
      message: error.message,
      stack: error.stack,
      post_id,
      hashtag
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to process hashtag request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET POST HASHTAGS
 */
const getPostHashtagsByPostId = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    Logger.warn('[Fetch Hashtags] postId missing in request');
    return res.status(400).json({ success: false, message: 'postId is required' });
  }

  try {
    Logger.info(`[Fetch Hashtags] Fetching hashtags for postId=${postId}`);
    
    // Use caching if available
    const hashtags = await safeQuery(
      'SELECT hashtag, created_at FROM post_hashtags WHERE post_id = ? ORDER BY id DESC LIMIT 50',
      [postId]
    );

    Logger.info(`[Fetch Hashtags] Success | hashtags count=${hashtags.length}`);

    return res.status(200).json({
      success: true,
      data: {
        hashtags: hashtags.map(h => h.hashtag),
        count: hashtags.length,
        postId
      }
    });

  } catch (error) {
    Logger.error('[Fetch Hashtags ERROR]', { 
      message: error.message, 
      postId 
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch hashtags' 
    });
  }
});

/**
 * RECORD VIDEO VIEW - UPDATED: Updates database immediately
 */
const recordVideoView = asyncHandler(async (req, res) => {
  const { video_id, user_id } = req.body;

  if (!video_id) {
    Logger.warn('[Record View] video_id missing in request');
    return res.status(400).json({ success: false, message: 'video_id is required' });
  }

  // Rate limiting
  const rateLimitKey = `view:${user_id || req.ip}:${video_id}`;
  if (!checkRateLimit(rateLimitKey, 'view')) {
    return res.status(202).json({ // Still accept but don't process
      success: true,
      message: 'View recorded (rate limited)',
      rateLimited: true
    });
  }

  try {
    Logger.info(`[Record View] Processing view for video: ${video_id}`);
    
    // 1. First update the database immediately
    const dbUpdated = await updateVideoViews(video_id, user_id);
    
    if (!dbUpdated) {
      Logger.warn(`[Record View] Failed to update database for video: ${video_id}`);
      return res.status(404).json({ success: false, message: 'Video not found or update failed' });
    }
    
    // 2. Then publish to RabbitMQ (async - fire and forget)
    try {
      await viewPublisher.publishViewEvent(video_id, user_id, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      });
      Logger.info(`[Record View] View published to RabbitMQ for video: ${video_id}`);
    } catch (mqError) {
      // RabbitMQ failure is OK - we already updated the database
      Logger.warn(`[Record View] RabbitMQ publishing failed, but database was updated: ${mqError.message}`);
    }

    // Return immediate success response
    return res.status(200).json({
      success: true,
      message: 'View recorded successfully',
      data: {
        video_id,
        recorded: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    Logger.error('[Record View ERROR]', {
      message: error.message,
      video_id
    });

    // Return error if database update failed
    return res.status(500).json({
      success: false,
      message: 'Failed to record view',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * RECORD VIDEO LIKE - UPDATED: Updates database immediately
 */
const recordVideoLike = asyncHandler(async (req, res) => {
  const { video_id, user_id, action = 'like' } = req.body;

  if (!video_id) {
    Logger.warn('[Record Like] video_id missing in request');
    return res.status(400).json({ success: false, message: 'video_id is required' });
  }

  // Rate limiting
  const rateLimitKey = `like:${user_id || req.ip}:${video_id}`;
  if (!checkRateLimit(rateLimitKey, 'like')) {
    return res.status(429).json({ 
      success: false, 
      message: 'Too many like requests. Please try again later.' 
    });
  }

  try {
    Logger.info(`[Record Like] Processing ${action} for video: ${video_id}`);
    
    // Validate action
    if (!['like', 'unlike'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Action must be either "like" or "unlike"' 
      });
    }
    
    // 1. First update the database immediately
    const dbUpdated = await updateVideoLikes(video_id, action, user_id);
    
    if (!dbUpdated) {
      Logger.warn(`[Record Like] Failed to update database for video: ${video_id}`);
      return res.status(404).json({ success: false, message: 'Video not found or update failed' });
    }
    
    // 2. Then publish to RabbitMQ (async - fire and forget)
    try {
      await likePublisher.publishLikeEvent(video_id, user_id, action);
      Logger.info(`[Record Like] Like action published to RabbitMQ for video: ${video_id}, action: ${action}`);
    } catch (mqError) {
      // RabbitMQ failure is OK - we already updated the database
      Logger.warn(`[Record Like] RabbitMQ publishing failed, but database was updated: ${mqError.message}`);
    }

    // Return immediate success response
    return res.status(200).json({
      success: true,
      message: `Like action (${action}) recorded successfully`,
      data: {
        video_id,
        action,
        recorded: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    Logger.error('[Record Like ERROR]', {
      message: error.message,
      video_id,
      action
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to record like action',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET VIDEO STATS
 */
const getVideoStats = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    Logger.warn('[Get Stats] videoId missing in request');
    return res.status(400).json({ success: false, message: 'videoId is required' });
  }

  try {
    Logger.info(`[Get Stats] Original videoId: ${videoId}`);
    
    const video = await findVideoById(videoId);
    
    if (!video) {
      Logger.warn(`[Get Stats] Video not found: videoId=${videoId}`);
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    Logger.info(`[Get Stats] Success | id=${video.id}, public_id=${video.public_id}, views=${video.views}, likes=${video.likes}`);
    
    // Return the actual public_id from database (with backup_videos/ prefix)
    return res.status(200).json({
      success: true,
      data: {
        video_id: video.public_id, // Return the full public_id with prefix
        views: video.views || 0,
        likes: video.likes || 0,
        fetched_at: new Date().toISOString()
      }
    });

  } catch (error) {
    Logger.error('[Get Stats ERROR]', {
      message: error.message,
      videoId
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch video stats'
    });
  }
});

/**
 * BULK OPERATIONS (for client-side batching)
 */
const bulkRecordViews = asyncHandler(async (req, res) => {
  const { views } = req.body;

  if (!Array.isArray(views) || views.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'views array is required' 
    });
  }

  // Limit batch size
  const batch = views.slice(0, 100);
  
  try {
    let successCount = 0;
    let failCount = 0;
    
    for (const view of batch) {
      if (view.video_id) {
        try {
          // Update database  for each view
          const updated = await updateVideoViews(view.video_id, view.user_id);
          if (updated) {
            successCount++;
            
            // Try to publish to RabbitMQ fire
            try {
              await viewPublisher.publishViewEvent(
                view.video_id, 
                view.user_id, 
                view.metadata
              );
            } catch (mqError) {
              // RabbitMQ failure 
              Logger.warn(`Bulk view RabbitMQ failed for ${view.video_id}: ${mqError.message}`);
            }
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
          Logger.error(`Failed to process bulk view for ${view.video_id}:`, error.message);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `Bulk views processed`,
      data: {
        processed_count: batch.length,
        success_count: successCount,
        fail_count: failCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    Logger.error('[Bulk Views ERROR]', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process bulk views',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  createHashTagToPost,
  getPostHashtagsByPostId,
  recordVideoView,
  recordVideoLike,
  getVideoStats,
  bulkRecordViews
};