const asyncHandler = require("express-async-handler");
const { safeQuery } = require("../configurations/db");
const redis = require("../utils/redis/redis");
const Logger = require("../utils/logger/logger");

const handleInteraction = asyncHandler(async (req, res) => {
  const { leader_id, user_id, type, platform } = req.body;
  const ip = req.ip;

  if (!leader_id || !type) {
    return res
      .status(400)
      .json({ message: "Missing leader_id or interaction type" });
  }

  // 1. Redis Lock Logic (Prevents double increment in high-speed clicks)
  const lockKey = `lock:${type}:${leader_id}:${user_id || ip}`;
  const isLocked = await redis.get(lockKey);
  if (isLocked) {
    return res
      .status(429)
      .json({ success: false, message: "Processed already" });
  }
  await redis.set(lockKey, "1", "EX", type === "view" ? 3600 : 5);

  try {
    let resultMessage = "";

    if (type === "like") {
      // Remove Dislike first
      const removed = await safeQuery(
        `DELETE FROM leader_dislikes WHERE leader_id=? AND (user_id=? OR ip_address=?)`,
        [leader_id, user_id, ip],
      );
      if (removed.affectedRows > 0) {
        await safeQuery(
          `UPDATE leaders SET dislikes = GREATEST(dislikes - 1, 0) WHERE leader_id=?`,
          [leader_id],
        );
      }
      // Insert Like
      const added = await safeQuery(
        `INSERT IGNORE INTO leader_likes (leader_id, user_id, ip_address) VALUES (?, ?, ?)`,
        [leader_id, user_id, ip],
      );
      if (added.affectedRows > 0) {
        await safeQuery(
          `UPDATE leaders SET likes = likes + 1 WHERE leader_id=?`,
          [leader_id],
        );
      }
      resultMessage = "Liked";
    } else if (type === "dislike") {
      // Remove Like first
      const removed = await safeQuery(
        `DELETE FROM leader_likes WHERE leader_id=? AND (user_id=? OR ip_address=?)`,
        [leader_id, user_id, ip],
      );
      if (removed.affectedRows > 0) {
        await safeQuery(
          `UPDATE leaders SET likes = GREATEST(likes - 1, 0) WHERE leader_id=?`,
          [leader_id],
        );
      }
      // Insert Dislike
      const added = await safeQuery(
        `INSERT IGNORE INTO leader_dislikes (leader_id, user_id, ip_address) VALUES (?, ?, ?)`,
        [leader_id, user_id, ip],
      );
      if (added.affectedRows > 0) {
        await safeQuery(
          `UPDATE leaders SET dislikes = dislikes + 1 WHERE leader_id=?`,
          [leader_id],
        );
      }
      resultMessage = "Disliked";
    } else if (type === "view") {
      await safeQuery(
        `UPDATE leaders SET views = views + 1 WHERE leader_id=?`,
        [leader_id],
      );
      await safeQuery(
        `INSERT INTO leader_views (leader_id, user_id, ip_address) VALUES (?, ?, ?)`,
        [leader_id, user_id, ip],
      );
      resultMessage = "Viewed";
    } else if (type === "share") {
      // Increment share count
      await safeQuery(
        `UPDATE leaders SET shares = shares + 1 WHERE leader_id=?`,
        [leader_id],
      );
      // Log share detail
      await safeQuery(
        `INSERT INTO leader_shares (leader_id, user_id, ip_address, platform) VALUES (?, ?, ?, ?)`,
        [leader_id, user_id, ip, platform || "general"],
      );
      resultMessage = "Shared";
    }

    // Return all stats including the NEW shares column
    const stats = await safeQuery(
      `SELECT likes, dislikes, views, shares FROM leaders WHERE leader_id=?`,
      [leader_id],
    );

    res
      .status(200)
      .json({ success: true, message: resultMessage, data: stats[0] });
  } catch (error) {
    Logger.error(`Interaction Error: ${error.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Comment Logic
const postComment = asyncHandler(async (req, res) => {
  const { leader_id, user_id, user_name, comment } = req.body;

  if (!comment || comment.trim().length < 2) {
    return res.status(400).json({ message: "Comment is too short" });
  }

  const comment_id = `cmt_${Math.random().toString(36).substr(2, 9)}`;

  await safeQuery(
    `INSERT INTO leader_comments (comment_id, leader_id, user_id, user_name, comment) VALUES (?, ?, ?, ?, ?)`,
    [comment_id, leader_id, user_id, user_name || "Anonymous", comment],
  );

  res.status(201).json({ success: true, message: "Comment posted" });
});

module.exports = { handleInteraction, postComment };
