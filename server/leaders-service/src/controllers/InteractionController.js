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
      const action = metadata?.action; // "like" or "unlike"

      if (action === "like") {
        // Remove dislike if exists
        await safeQuery(
          `DELETE FROM leader_dislikes WHERE leader_id = ? AND (user_id = ? OR (user_id IS NULL AND ip_address = ?))`,
          [leaderId, user_id, ip],
        );

        // Add like - NO CHECK for existing like
        // This allows multiple likes from same IP/user
        await safeQuery(
          `INSERT INTO leader_likes (leader_id, user_id, ip_address) VALUES (?, ?, ?)`,
          [leaderId, user_id, ip],
        );
      } else if (action === "unlike") {
        // Remove like - remove only ONE like, not all
        await safeQuery(
          `DELETE FROM leader_likes WHERE leader_id = ? AND (user_id = ? OR (user_id IS NULL AND ip_address = ?)) LIMIT 1`,
          [leaderId, user_id, ip],
        );
      }

      resultMessage = action === "like" ? "Liked" : "Unliked";
    } else if (interactionType === "view") {
      // Always record view - NO CHECKS, allow multiple views from same IP
      await safeQuery(
        `INSERT INTO leader_views (leader_id, user_id, ip_address, session_id, viewed_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [leaderId, user_id, ip, metadata?.sessionId || null],
      );

      resultMessage = "Viewed";
    } else if (interactionType === "info_view") {
      // Record info view - allow multiple
      await safeQuery(
        `INSERT INTO leader_views (leader_id, user_id, ip_address, session_id, viewed_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [leaderId, user_id, ip, `info_${metadata?.sessionId || ""}`],
      );
      resultMessage = "Info viewed";
    }

    // Get updated counts
    const [likes, views] = await Promise.all([
      safeQueryOne(
        `SELECT COUNT(*) as count FROM leader_likes WHERE leader_id = ?`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT COUNT(*) as count FROM leader_views WHERE leader_id = ?`,
        [leaderId],
      ),
    ]);

    updatedStats = {
      likes: parseInt(likes?.count) || 0,
      views: parseInt(views?.count) || 0,
    };

    // Clear cache for this leader
    await redis.del(`leader:${leaderId}`);

    res.status(200).json({
      success: true,
      message: resultMessage,
      count: updatedStats.likes,
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

// Optional: Get total interaction counts
const getLeaderInteractionCounts = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;

  try {
    const [likes, views, comments] = await Promise.all([
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
    ]);

    res.status(200).json({
      success: true,
      data: {
        likes: parseInt(likes?.count) || 0,
        views: parseInt(views?.count) || 0,
        comments: parseInt(comments?.count) || 0,
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

module.exports = {
  handleInteraction,
  postComment,
  getLeaderInteractionCounts,
};
