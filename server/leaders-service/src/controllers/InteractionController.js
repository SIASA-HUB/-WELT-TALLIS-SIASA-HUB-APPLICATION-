const asyncHandler = require("express-async-handler");
const { safeQuery, safeQueryOne } = require("../configurations/db");
const redis = require("../utils/redis/redis");
const Logger = require("../utils/logger/logger");

const handleInteraction = asyncHandler(async (req, res) => {
  const { leaderId, interactionType, metadata } = req.body;
  const ip = req.ip;
  const user_id = metadata?.userId || metadata?.deviceId || null;

  if (!leaderId || !interactionType) {
    return res.status(400).json({
      success: false,
      message: "Missing leaderId or interactionType",
    });
  }

  try {
    let resultMessage = "";
    let updatedStats = {};

    if (interactionType === "like") {
      const action = metadata?.action; 

      if (action === "like") {
       
        await safeQuery(
          `DELETE FROM leader_dislikes WHERE leader_id = ? AND (user_id = ? OR (user_id IS NULL AND ip_address = ?))`,
          [leaderId, user_id, ip],
        );

 
        await safeQuery(
          `INSERT INTO leader_likes (leader_id, user_id, ip_address) VALUES (?, ?, ?)`,
          [leaderId, user_id, ip],
        );
      } else if (action === "unlike") {
  
        await safeQuery(
          `DELETE FROM leader_likes WHERE leader_id = ? AND (user_id = ? OR (user_id IS NULL AND ip_address = ?)) LIMIT 1`,
          [leaderId, user_id, ip],
        );
      }

      resultMessage = action === "like" ? "Liked" : "Unliked";
    } 
    else if (interactionType === "view" || interactionType === "info_view") {
      // Record view
      await safeQuery(
        `INSERT INTO leader_views (leader_id, user_id, ip_address, session_id, viewed_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [leaderId, user_id, ip, metadata?.sessionId || null],
      );
      
      // Update aggregate views count in leaders table
      await safeQuery(
        `UPDATE leaders SET views = views + 1 WHERE leader_id = ?`,
        [leaderId]
      );
      
      resultMessage = "Viewed";
    }
    else if (interactionType === "share") {
      // Record share
      await safeQuery(
        `INSERT INTO leader_shares (leader_id, user_id, ip_address, platform) 
         VALUES (?, ?, ?, ?)`,
        [leaderId, user_id, ip, metadata?.platform || 'Direct'],
      );
      
      // Update aggregate shares count in leaders table
      await safeQuery(
        `UPDATE leaders SET shares = shares + 1 WHERE leader_id = ?`,
        [leaderId]
      );
      
      resultMessage = "Shared";
    }
    else if (interactionType === "time_spent") {
      // NEW: Track time spent on profile
      const timeSpent = metadata?.time_spent || 0;
      
      // Only track if time spent is meaningful (>= 3 seconds)
      if (timeSpent >= 3) {
        await safeQuery(
          `INSERT INTO leader_time_spent (leader_id, user_id, ip_address, session_id, time_spent_seconds, recorded_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [leaderId, user_id, ip, metadata?.sessionId || null, timeSpent],
        );
        
        // Update average time spent in leaders table (optional)
        await safeQuery(
          `UPDATE leaders 
           SET total_time_spent = total_time_spent + ?,
               avg_time_spent = (total_time_spent + ?) / (SELECT COUNT(*) FROM leader_views WHERE leader_id = ?)
           WHERE leader_id = ?`,
          [timeSpent, timeSpent, leaderId, leaderId]
        );
        
        resultMessage = "Time tracked";
      }
    }

    // Get updated counts
    const [likes, views, shares, timeSpentData] = await Promise.all([
      safeQueryOne(
        `SELECT COUNT(*) as count FROM leader_likes WHERE leader_id = ?`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT COUNT(*) as count FROM leader_views WHERE leader_id = ?`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT COUNT(*) as count FROM leader_shares WHERE leader_id = ?`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT AVG(time_spent_seconds) as avg_time, SUM(time_spent_seconds) as total_time 
         FROM leader_time_spent WHERE leader_id = ?`,
        [leaderId],
      ),
    ]);
    
    updatedStats = {
      likes: parseInt(likes?.count) || 0,
      views: parseInt(views?.count) || 0,
      shares: parseInt(shares?.count) || 0,
      avgTimeSpent: Math.round(timeSpentData?.avg_time) || 0,
      totalTimeSpent: parseInt(timeSpentData?.total_time) || 0,
    };

    // Clear cache for this leader
    try {
      await redis.del(`leader:${leaderId}`);
    } catch (e) {
      Logger.warn(`Failed to clear cache for leader ${leaderId}: ${e.message}`);
    }

    res.status(200).json({
      success: true,
      message: resultMessage,
      data: updatedStats,
    });
  } catch (error) {
    Logger.error(`Interaction Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

const postComment = asyncHandler(async (req, res) => {
  const { leaderId, userId, userName, comment } = req.body;

  if (!comment || comment.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Comment is too short",
    });
  }

  if (!leaderId) {
    return res.status(400).json({
      success: false,
      message: "Leader ID required",
    });
  }

  try {
    const commentId = `cmt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    await safeQuery(
      `INSERT INTO leader_comments (comment_id, leader_id, user_id, user_name, comment, ip_address, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [commentId, leaderId, userId, userName || "Anonymous", comment, req.ip],
    );

    // Update comment count in leaders table
    await safeQuery(
      `UPDATE leaders SET comments_count = comments_count + 1 WHERE leader_id = ?`,
      [leaderId]
    );

    // Get updated comment count
    const count = await safeQueryOne(
      `SELECT COUNT(*) as total FROM leader_comments WHERE leader_id = ?`,
      [leaderId],
    );

    res.status(201).json({
      success: true,
      message: "Comment posted",
      commentId,
      totalComments: parseInt(count?.total) || 0,
    });
  } catch (error) {
    Logger.error(`Comment Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get total interaction counts
const getLeaderInteractionCounts = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;

  try {
    const [likes, views, comments, shares, timeSpent] = await Promise.all([
      safeQueryOne(
        `SELECT COUNT(*) as count FROM leader_likes WHERE leader_id = ?`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT COUNT(*) as count FROM leader_views WHERE leader_id = ?`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT COUNT(*) as count FROM leader_comments WHERE leader_id = ?`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT COUNT(*) as count FROM leader_shares WHERE leader_id = ?`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT AVG(time_spent_seconds) as avg_time_spent, 
                SUM(time_spent_seconds) as total_time_spent 
         FROM leader_time_spent WHERE leader_id = ?`,
        [leaderId],
      ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        likes: parseInt(likes?.count) || 0,
        views: parseInt(views?.count) || 0,
        comments: parseInt(comments?.count) || 0,
        shares: parseInt(shares?.count) || 0,
        avgTimeSpent: Math.round(timeSpent?.avg_time_spent) || 0,
        totalTimeSpent: parseInt(timeSpent?.total_time_spent) || 0,
      },
    });
  } catch (error) {
    Logger.error(`Get counts error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// NEW: Get time spent analytics for a leader
const getLeaderTimeAnalytics = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const { period = 'day' } = req.query; // day, week, month, all

  try {
    let timeFilter = '';
    if (period === 'day') {
      timeFilter = 'AND recorded_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
    } else if (period === 'week') {
      timeFilter = 'AND recorded_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      timeFilter = 'AND recorded_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    const [avgTime, totalSessions, timeDistribution] = await Promise.all([
      safeQueryOne(
        `SELECT AVG(time_spent_seconds) as avg_time 
         FROM leader_time_spent 
         WHERE leader_id = ? ${timeFilter}`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT COUNT(*) as total_sessions 
         FROM leader_time_spent 
         WHERE leader_id = ? ${timeFilter}`,
        [leaderId],
      ),
      safeQuery(
        `SELECT 
          CASE 
            WHEN time_spent_seconds < 10 THEN '< 10s'
            WHEN time_spent_seconds BETWEEN 10 AND 29 THEN '10-29s'
            WHEN time_spent_seconds BETWEEN 30 AND 59 THEN '30-59s'
            WHEN time_spent_seconds BETWEEN 60 AND 119 THEN '1-2min'
            ELSE '> 2min'
          END as time_range,
          COUNT(*) as count
         FROM leader_time_spent 
         WHERE leader_id = ? ${timeFilter}
         GROUP BY time_range
         ORDER BY MIN(time_spent_seconds)`,
        [leaderId],
      ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        avgTimeSpent: Math.round(avgTime?.avg_time) || 0,
        totalSessions: parseInt(totalSessions?.total_sessions) || 0,
        distribution: timeDistribution || [],
      },
    });
  } catch (error) {
    Logger.error(`Time analytics error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Specialized handlers for RESTful routes
const trackView = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const { userId, sessionId } = req.body;
  const ip = req.ip;

  await safeQuery(
    `INSERT INTO leader_views (leader_id, user_id, ip_address, session_id, viewed_at) 
     VALUES (?, ?, ?, ?, NOW())`,
    [leaderId, userId || null, ip, sessionId || null],
  );

  await safeQuery(
    `UPDATE leaders SET views = views + 1 WHERE leader_id = ?`,
    [leaderId]
  );

  res.status(200).json({ success: true, message: "View tracked" });
});

const trackShare = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const { userId, platform } = req.body;
  const ip = req.ip;

  await safeQuery(
    `INSERT INTO leader_shares (leader_id, user_id, ip_address, platform) 
     VALUES (?, ?, ?, ?)`,
    [leaderId, userId || null, ip, platform || 'Direct'],
  );

  await safeQuery(
    `UPDATE leaders SET shares = shares + 1 WHERE leader_id = ?`,
    [leaderId]
  );

  res.status(200).json({ success: true, message: "Share tracked" });
});

const trackTimeSpent = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const { userId, sessionId, time_spent } = req.body;
  const ip = req.ip;

  if (!time_spent || time_spent < 3) {
    return res.status(200).json({ success: true, message: "Time spent too low to track" });
  }

  await safeQuery(
    `INSERT INTO leader_time_spent (leader_id, user_id, ip_address, session_id, time_spent_seconds, recorded_at) 
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [leaderId, userId || null, ip, sessionId || null, time_spent],
  );

  // Update aggregate stats
  await safeQuery(
    `UPDATE leaders 
     SET total_time_spent = total_time_spent + ?,
         avg_time_spent = (total_time_spent + ?) / GREATEST((SELECT COUNT(*) FROM leader_views WHERE leader_id = ?), 1)
     WHERE leader_id = ?`,
    [time_spent, time_spent, leaderId, leaderId]
  );

  res.status(200).json({ success: true, message: "Time spent tracked" });
});

const handleSupport = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const { user_id, status } = req.body; // status is true for support, false for remove support
  const ip = req.ip;

  try {
    if (status) {
      // Add support (like)
      await safeQuery(
        `INSERT IGNORE INTO leader_likes (leader_id, user_id, ip_address) VALUES (?, ?, ?)`,
        [leaderId, user_id || null, ip]
      );
    } else {
      // Remove support
      await safeQuery(
        `DELETE FROM leader_likes WHERE leader_id = ? AND (user_id = ? OR (user_id IS NULL AND ip_address = ?))`,
        [leaderId, user_id || null, ip]
      );
    }

    // Get updated counts
    const count = await safeQueryOne(
      `SELECT COUNT(*) as total FROM leader_likes WHERE leader_id = ?`,
      [leaderId]
    );

    res.status(200).json({
      success: true,
      message: status ? "Supporting" : "Support removed",
      data: {
        support_count: parseInt(count?.total) || 0,
        is_supporting: status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const trackClick = asyncHandler(async (req, res) => {
  const { element_id, element_class, element_tag, page_url, text_content, user_id } = req.body;
  const ip = req.ip;

  try {
    // Optionally log to DB if a table exists, for now just log and return OK
    Logger.info("Click Tracked", { 
      element_id, 
      element_tag, 
      page_url, 
      text_content, 
      user_id,
      ip 
    });

    res.status(200).json({ success: true, message: "Click tracked" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const getSupportedLeaders = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: "User ID required" });
  }

  try {
    const supported = await safeQuery(
      `SELECT l.leader_id, l.name, l.county, l.constituency, l.ward, l.position, l.party, l.profile_image, l.slug, ll.created_at as joined_at
       FROM leader_likes ll
       JOIN leaders l ON ll.leader_id = l.leader_id
       WHERE ll.user_id = ?
       ORDER BY ll.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      data: Array.isArray(supported) ? supported : []
    });
  } catch (error) {
    Logger.error(`Get supported leaders error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = {
  handleInteraction,
  postComment,
  getLeaderInteractionCounts,
  getLeaderTimeAnalytics,
  trackView,
  trackShare,
  trackTimeSpent,
  handleSupport,
  trackClick,
  getSupportedLeaders,
};
