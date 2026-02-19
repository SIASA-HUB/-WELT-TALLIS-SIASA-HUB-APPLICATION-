const asyncHandler = require('express-async-handler');
const { safeQuery } = require('../configurations/db');
const Logger = require('../utils/logger/logger');

/**
 * LIKE a leader
 */

const likeLeader = asyncHandler(async (req, res) => {
  const { leader_id, user_id, user_name } = req.body;

  Logger.info(`[likeLeader] Incoming request`, { leader_id, user_id, user_name });

  if (!leader_id) {
    Logger.warn(`[likeLeader] Missing leader_id`);
    throw new Error('leader_id is required');
  }
  if (!user_id) {
    Logger.warn(`[likeLeader] Missing user_id`);
    throw new Error('user_id is required');
  }

  const safeUserName = user_name || null;

  try {
    // Check if user already liked
    const existingLike = await safeQuery(
      `SELECT * FROM leader_likes WHERE leader_id = ? AND user_id = ?`,
      [leader_id, user_id]
    );

    Logger.info(`[likeLeader] existingLike fetched`, { count: existingLike.length });

    if (existingLike.length > 0) {
      Logger.info(`[likeLeader] User already liked this leader`);
      return res.status(400).json({ 
        success: false, 
        message: 'User already liked this leader' 
      });
    }

    // Remove any existing dislike
    const removedDislike = await safeQuery(
      `DELETE FROM leader_dislikes WHERE leader_id = ? AND user_id = ?`,
      [leader_id, user_id]
    );
    Logger.info(`[likeLeader] Removed existing dislikes`, { affectedRows: removedDislike.affectedRows || 0 });

    // Update leader stats
    await safeQuery(`UPDATE leaders SET likes = likes + 1 WHERE leader_id = ?`, [leader_id]);
    Logger.info(`[likeLeader] Leader likes incremented`, { leader_id });

    // Record the like
    await safeQuery(
      `INSERT INTO leader_likes (leader_id, user_id, user_name, action_time) VALUES (?, ?, ?, NOW())`,
      [leader_id, user_id, safeUserName]
    );
    Logger.info(`[likeLeader] Recorded new like`, { leader_id, user_id, user_name: safeUserName });

    // Fetch updated leader stats
    const leaderStats = await safeQuery(
      `SELECT likes, dislikes, views, followers FROM leaders WHERE leader_id = ?`,
      [leader_id]
    );

    res.status(200).json({ 
      success: true, 
      message: 'Liked successfully',
      data: leaderStats[0],
      user_action: {
        user_id,
        user_name: safeUserName,
        action: 'like',
        timestamp: new Date().toISOString()
      }
    });

    Logger.info(`[likeLeader] Response sent`, { leader_id });

  } catch (error) {
    Logger.error(`[likeLeader] Error`, { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to like leader', error: error.message });
  }
});


/**
 * DISLIKE a leader
 */

const dislikeLeader = asyncHandler(async (req, res) => {
  const { leader_id, user_id, user_name } = req.body;

  Logger.info(`[dislikeLeader] Incoming request`, { leader_id, user_id, user_name });

  if (!leader_id) {
    Logger.warn(`[dislikeLeader] Missing leader_id`);
    throw new Error('leader_id is required');
  }
  if (!user_id) {
    Logger.warn(`[dislikeLeader] Missing user_id`);
    throw new Error('user_id is required');
  }

  const safeUserName = user_name || null;

  try {
    // Check if user already disliked
    const existingDislike = await safeQuery(
      `SELECT * FROM leader_dislikes WHERE leader_id = ? AND user_id = ?`,
      [leader_id, user_id]
    );
    Logger.info(`[dislikeLeader] existingDislike fetched`, { count: existingDislike.length });

    if (existingDislike.length > 0) {
      Logger.info(`[dislikeLeader] User already disliked this leader`);
      return res.status(400).json({
        success: false,
        message: 'User already disliked this leader'
      });
    }

    // Remove any existing like
    const removedLike = await safeQuery(
      `DELETE FROM leader_likes WHERE leader_id = ? AND user_id = ?`,
      [leader_id, user_id]
    );
    Logger.info(`[dislikeLeader] Removed existing likes`, { affectedRows: removedLike.affectedRows || 0 });

    // Update leader stats
    await safeQuery(`UPDATE leaders SET dislikes = dislikes + 1 WHERE leader_id = ?`, [leader_id]);
    Logger.info(`[dislikeLeader] Leader dislikes incremented`, { leader_id });

    // Record the dislike
    await safeQuery(
      `INSERT INTO leader_dislikes (leader_id, user_id, user_name, action_time) VALUES (?, ?, ?, NOW())`,
      [leader_id, user_id, safeUserName]
    );
    Logger.info(`[dislikeLeader] Recorded new dislike`, { leader_id, user_id, user_name: safeUserName });

    // Fetch updated leader stats
    const leaderStats = await safeQuery(
      `SELECT likes, dislikes, views, followers FROM leaders WHERE leader_id = ?`,
      [leader_id]
    );

    res.status(200).json({
      success: true,
      message: 'Disliked successfully',
      data: leaderStats[0],
      user_action: {
        user_id,
        user_name: safeUserName,
        action: 'dislike',
        timestamp: new Date().toISOString()
      }
    });

    Logger.info(`[dislikeLeader] Response sent`, { leader_id });

  } catch (error) {
    Logger.error(`[dislikeLeader] Error`, { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to dislike leader', error: error.message });
  }
});



/**
 * INCREMENT views
 */

const incrementLeaderViews = asyncHandler(async (req, res) => {
  const { leader_id, user_id, user_name } = req.body;
  if (!leader_id) throw new Error('leader_id is required');
  
  // Increment total views in leaders table
  await safeQuery(
    `UPDATE leaders SET views = views + 1 WHERE leader_id = ?`,
    [leader_id]
  );

  // Log view in leader_views table if user info is provided
  if (user_id || user_name) {
    await safeQuery(
      `INSERT INTO leader_views (leader_id, user_id, user_name, view_time) VALUES (?, ?, ?, NOW())`,
      [leader_id, user_id || null, user_name || null]
    );
  }

  // Return updated stats
  const [leader] = await safeQuery(
    `SELECT likes, dislikes, views, followers FROM leaders WHERE leader_id = ?`,
    [leader_id]
  );

  res.status(200).json({
    success: true,
    message: 'View counted',
    data: leader[0],
    user_info: user_id || user_name ? { user_id, user_name } : null
  });
});

/**
 * FOLLOW a leader (increment followers)
 */

const followLeader = asyncHandler(async (req, res) => {
  const { leader_id, user_id, user_name } = req.body;

  if (!leader_id) throw new Error('leader_id is required');
  if (!user_id) throw new Error('user_id is required');

  const safeUserName = user_name || null; // optional

  // Check if user already follows
const existingFollowRows = await safeQuery(
  `SELECT * FROM leader_followers WHERE leader_id = ? AND user_id = ?`,
  [leader_id, user_id]
);

if (existingFollowRows.length > 0) {
  return res.status(400).json({
    success: false,
    message: 'User already follows this leader'
  });
}
  // Increment followers count in leaders table
  await safeQuery(
    `UPDATE leaders SET followers = followers + 1 WHERE leader_id = ?`,
    [leader_id]
  );

  // Record follow action
  await safeQuery(
    `INSERT INTO leader_followers (leader_id, user_id, user_name, follow_time) 
     VALUES (?, ?, ?, NOW())`,
    [leader_id, user_id, safeUserName]
  );

  // Fetch updated stats
  const [leaderRows] = await safeQuery(
    `SELECT likes, dislikes, views, followers FROM leaders WHERE leader_id = ?`,
    [leader_id]
  );

  res.status(200).json({
    success: true,
    message: 'Followed successfully',
    data: leaderRows[0],
    user_action: {
      user_id,
      user_name: safeUserName,
      action: 'follow',
      timestamp: new Date().toISOString()
    }
  });
});


/**
 * UNFOLLOW a leader
 */
const unfollowLeader = asyncHandler(async (req, res) => {
  const { leader_id, user_id } = req.body;
  if (!leader_id || !user_id) throw new Error('leader_id and user_id are required');

  // Update leader followers count
  await safeQuery(`UPDATE leaders SET followers = GREATEST(followers - 1, 0) WHERE leader_id = ?`, [leader_id]);
  
  // Remove follow record
  await safeQuery(
    `DELETE FROM leader_followers WHERE leader_id = ? AND user_id = ?`,
    [leader_id, user_id]
  );

  const [leader] = await safeQuery(
    `SELECT likes, dislikes, views, followers FROM leaders WHERE leader_id = ?`,
    [leader_id]
  );

  res.status(200).json({ 
    success: true, 
    message: 'Unfollowed successfully',
    data: leader[0]
  });
});

/**
 * GET leader stats (likes, dislikes, views, followers)
 */

const getLeaderStats = asyncHandler(async (req, res) => {
  const { leader_id } = req.params;
  if (!leader_id) throw new Error('leader_id is required');

  // Fetch main leader stats
  const leaderRows = await safeQuery(
    `SELECT likes, dislikes, views, followers FROM leaders WHERE leader_id = ?`,
    [leader_id]
  );
  if (!leaderRows.length) throw new Error('Leader not found');

  const leader = leaderRows[0];

  // Fetch recent actions
  const recentLikes = await safeQuery(
    `SELECT user_name, action_time 
     FROM leader_likes 
     WHERE leader_id = ? 
     ORDER BY action_time DESC 
     LIMIT 5`,
    [leader_id]
  );

  const recentDislikes = await safeQuery(
    `SELECT user_name, action_time 
     FROM leader_dislikes 
     WHERE leader_id = ? 
     ORDER BY action_time DESC 
     LIMIT 5`,
    [leader_id]
  );

  const recentFollowers = await safeQuery(
    `SELECT user_name, follow_time 
     FROM leader_followers 
     WHERE leader_id = ? 
     ORDER BY follow_time DESC 
     LIMIT 5`,
    [leader_id]
  );

  res.status(200).json({
    success: true,
    data: leader,
    recent_actions: {
      likes: recentLikes,
      dislikes: recentDislikes,
      followers: recentFollowers
    }
  });
});

/**
 * Get user interaction status for a leader
 */
const getUserInteractionStatus = asyncHandler(async (req, res) => {
  const { leader_id, user_id } = req.params;
  
  const [likeStatus] = await safeQuery(
    `SELECT 1 FROM leader_likes WHERE leader_id = ? AND user_id = ?`,
    [leader_id, user_id]
  );

  const [dislikeStatus] = await safeQuery(
    `SELECT 1 FROM leader_dislikes WHERE leader_id = ? AND user_id = ?`,
    [leader_id, user_id]
  );

  const [followStatus] = await safeQuery(
    `SELECT 1 FROM leader_followers WHERE leader_id = ? AND user_id = ?`,
    [leader_id, user_id]
  );

  res.status(200).json({
    success: true,
    data: {
      has_liked: likeStatus.length > 0,
      has_disliked: dislikeStatus.length > 0,
      is_following: followStatus.length > 0
    }
  });
});

module.exports = {
  likeLeader,
  dislikeLeader,
  incrementLeaderViews,
  followLeader,
  unfollowLeader,
  getLeaderStats,
  getUserInteractionStatus
};