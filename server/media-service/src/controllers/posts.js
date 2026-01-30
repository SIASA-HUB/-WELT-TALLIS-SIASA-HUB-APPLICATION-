// controllers/postController.js
const asyncHandler = require('express-async-handler');
const Logger = require('../utils/logger/logger');
const redis = require('../utils/redis/redis');
const { v4: uuidv4 } = require('uuid');
const { safeQuery, safeQueryOne } = require('../configurations/db');

// Helper: Generate a unique Post ID
function generatePostId() {
  return `post_${uuidv4()}`;
}

// Generate personalized feed key for user
function getUserFeedKey(userId) {
  return `user:${userId}:feed`;
}

// Generate trending posts key
function getTrendingPostsKey() {
  return 'trending:posts';
}

// Generate post cache key
function getPostCacheKey(postId) {
  return `post:${postId}`;
}

// Generate user interests key
function getUserInterestsKey(userId) {
  return `user:${userId}:interests`;
}

// Update Redis after post creation
async function updateRedisAfterPostCreation(postData) {
  try {
    if (!redis.isConnected) return;

    const postId = postData.post_id;
    
    // 1. Cache the post data
    await redis.set(getPostCacheKey(postId), JSON.stringify(postData));
    
    // 2. Add to global posts sorted set (by timestamp)
    await redis.zadd('posts:timeline', Date.now(), postId);
    
    // 3. Add to trending posts (start with 0 score)
    await redis.zadd(getTrendingPostsKey(), 0, postId);
    
    // 4. Add post to followers' feeds
    await addPostToFollowersFeeds(postData.user_id, postId);
    
    // 5. Update user's own feed
    await redis.lpush(getUserFeedKey(postData.user_id), postId);
    await redis.ltrim(getUserFeedKey(postData.user_id), 0, 499); // Keep last 500 posts
    
    Logger.info(`Redis updated for new post: ${postId}`);
  } catch (error) {
    Logger.error('Error updating Redis after post creation:', error);
  }
}

// Add post to followers' feeds
async function addPostToFollowersFeeds(userId, postId) {
  try {
    // Get user's followers
    const [followers] = await safeQuery(
      'SELECT follower_id FROM followers WHERE following_id = ?',
      [userId]
    );
    
    // Add post to each follower's feed
    for (const follower of followers) {
      const feedKey = getUserFeedKey(follower.follower_id);
      await redis.lpush(feedKey, postId);
      await redis.ltrim(feedKey, 0, 499); // Keep last 500 posts
    }
    
    Logger.info(`Post ${postId} added to ${followers.length} followers' feeds`);
  } catch (error) {
    Logger.error('Error adding post to followers feeds:', error);
  }
}

// Calculate personalized score for a post based on user interests
async function calculatePersonalizedScore(userId, postId, postData) {
  let score = 0;
  
  try {
    // Get user interests from cache or DB
    const userInterests = await getUserInterests(userId);
    
    // Score based on tags matching
    if (postData.tags) {
      const postTags = postData.tags.split(',').map(tag => tag.trim().toLowerCase());
      const interestTags = userInterests.map(interest => interest.toLowerCase());
      
      const matches = postTags.filter(tag => interestTags.includes(tag)).length;
      score += matches * 10; // 10 points per matching tag
    }
    
    // Score based on author relationship
    const [isFollowing] = await safeQuery(
      'SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?',
      [userId, postData.user_id]
    );
    
    if (isFollowing) {
      score += 20; // Bonus for following author
    }
    
    // Score based on post age (newer posts get higher score)
    const postAge = Date.now() - new Date(postData.created_at).getTime();
    const ageInHours = postAge / (1000 * 60 * 60);
    const ageScore = Math.max(0, 24 - ageInHours); // Up to 24 points for new posts
    score += ageScore;
    
    // Score based on engagement
    const engagement = (postData.likes || 0) - (postData.dislikes || 0);
    score += engagement * 0.5; // 0.5 points per net like
    
    return Math.max(0, Math.min(100, score)); // Normalize to 0-100
  } catch (error) {
    Logger.error('Error calculating personalized score:', error);
    return 50; // Default score
  }
}

// Get user interests from cache or DB
async function getUserInterests(userId) {
  try {
    // Try to get from Redis first
    const cacheKey = getUserInterestsKey(userId);
    if (redis.isConnected) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    
    // Get from database
    const [interests] = await safeQuery(
      'SELECT interest FROM user_interests WHERE user_id = ?',
      [userId]
    );
    
    const interestList = interests.map(i => i.interest);
    
    // Cache for future use
    if (redis.isConnected) {
      await redis.set(cacheKey, JSON.stringify(interestList), 'EX', 3600); // 1 hour cache
    }
    
    return interestList;
  } catch (error) {
    Logger.error('Error getting user interests:', error);
    return [];
  }
}

// Create a post
const createPost = asyncHandler(async (req, res) => {
  const { user_id, title, description, tags, image_url, rally_time } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // 1. Check if user is verified
    const user = await safeQueryOne('SELECT * FROM users WHERE user_id = ? AND verified = 1', [user_id]);

    if (!user) {
      return res.status(403).json({ message: 'Only verified users can create posts' });
    }

    // 2. Generate post_id
    const post_id = generatePostId();
    const created_at = new Date();
    const updated_at = created_at;

    // 3. Insert post into DB
    const query = `
      INSERT INTO posts 
        (post_id, user_id, title, description, tags, image_url, rally_time, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await safeQuery(query, [
      post_id,
      user_id,
      title || null,
      description || null,
      tags || null,
      image_url || null,
      rally_time || null,
      created_at,
      updated_at
    ]);

    // 4. Prepare post data for caching
    const postData = {
      post_id,
      user_id,
      title: title || null,
      description: description || null,
      tags: tags || null,
      image_url: image_url || null,
      rally_time: rally_time || null,
      created_at,
      updated_at,
      author_name: user.name
    };

    // 5. Update Redis asynchronously (don't wait for completion)
    updateRedisAfterPostCreation(postData);

    return res.status(201).json({
      message: 'Post created successfully',
      post_id,
      post: postData
    });

  } catch (error) {
    Logger.error('createPost error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get personalized feed for user
const getPersonalizedFeed = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user?.user_id;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    let postIds = [];
    let useCache = false;

    // Try to get from Redis first
    if (redis.isConnected) {
      const feedKey = getUserFeedKey(userId);
      const cachedPostIds = await redis.lrange(feedKey, offset, offset + limit - 1);
      
      if (cachedPostIds && cachedPostIds.length > 0) {
        postIds = cachedPostIds;
        useCache = true;
      }
    }

    // If no cached posts or Redis not available, get from database
    if (!useCache) {
      const [posts] = await safeQuery(`
        SELECT p.post_id 
        FROM posts p
        LEFT JOIN followers f ON p.user_id = f.following_id AND f.follower_id = ?
        WHERE p.user_id = ? OR f.follower_id = ?
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, userId, userId, limit, offset]);
      
      postIds = posts.map(p => p.post_id);
    }

    // Get detailed post data
    const detailedPosts = await getPostsDetails(postIds, userId);

    // Sort by personalized score (highest first)
    detailedPosts.sort((a, b) => b.personalized_score - a.personalized_score);

    // Update user's feed in Redis (async)
    if (redis.isConnected && !useCache) {
      updateUserFeedInRedis(userId, postIds);
    }

    return res.status(200).json({
      posts: detailedPosts,
      page: parseInt(page),
      limit: parseInt(limit),
      total: detailedPosts.length,
      source: useCache ? 'redis' : 'database'
    });

  } catch (error) {
    Logger.error('getPersonalizedFeed error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get post details with personalized scores
async function getPostsDetails(postIds, userId) {
  if (!postIds.length) return [];

  try {
    // Get posts from cache or database
    const posts = await getPostsFromCacheOrDB(postIds);
    
    // Calculate personalized scores for each post
    const postsWithScores = await Promise.all(
      posts.map(async (post) => {
        const personalized_score = await calculatePersonalizedScore(userId, post.post_id, post);
        return {
          ...post,
          personalized_score,
          is_following_author: await checkIfFollowing(userId, post.user_id)
        };
      })
    );

    return postsWithScores;
  } catch (error) {
    Logger.error('Error getting post details:', error);
    return [];
  }
}

// Get posts from cache or database
async function getPostsFromCacheOrDB(postIds) {
  const posts = [];
  const uncachedIds = [];

  // Try to get from Redis first
  if (redis.isConnected) {
    for (const postId of postIds) {
      const cached = await redis.get(getPostCacheKey(postId));
      if (cached) {
        posts.push(JSON.parse(cached));
      } else {
        uncachedIds.push(postId);
      }
    }
  } else {
    uncachedIds.push(...postIds);
  }

  // Get uncached posts from database
  if (uncachedIds.length > 0) {
    const placeholders = uncachedIds.map(() => '?').join(',');
    const [dbPosts] = await safeQuery(`
      SELECT 
        p.*, 
        u.name as author_name,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id AND type = 'like') as likes,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id AND type = 'dislike') as dislikes,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.post_id IN (${placeholders})
    `, uncachedIds);

    // Cache the new posts in Redis
    if (redis.isConnected) {
      for (const post of dbPosts) {
        await redis.set(getPostCacheKey(post.post_id), JSON.stringify(post), 'EX', 3600);
        posts.push(post);
      }
    } else {
      posts.push(...dbPosts);
    }
  }

  return posts;
}

// Check if user is following another user
async function checkIfFollowing(followerId, followingId) {
  try {
    const [result] = await safeQuery(
      'SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    return !!result;
  } catch (error) {
    return false;
  }
}

// Update user's feed in Redis
async function updateUserFeedInRedis(userId, postIds) {
  try {
    if (!redis.isConnected) return;

    const feedKey = getUserFeedKey(userId);
    
    // Add posts to feed
    for (const postId of postIds.reverse()) { // Reverse to maintain chronological order
      await redis.lpush(feedKey, postId);
    }
    
    // Trim feed to keep only last 500 posts
    await redis.ltrim(feedKey, 0, 499);
    
    // Set expiry (7 days)
    await redis.expire(feedKey, 7 * 24 * 3600);
    
    Logger.info(`Updated Redis feed for user ${userId} with ${postIds.length} posts`);
  } catch (error) {
    Logger.error('Error updating user feed in Redis:', error);
  }
}

// Get trending posts
const getTrendingPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let postIds = [];
    
    // Get from Redis sorted set
    if (redis.isConnected) {
      postIds = await redis.zrevrange(getTrendingPostsKey(), offset, offset + limit - 1);
    }

    // If Redis not available or no posts, get from database
    if (!postIds.length) {
      const [posts] = await safeQuery(`
        SELECT p.post_id 
        FROM posts p
        ORDER BY (
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id AND type = 'like') -
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id AND type = 'dislike') +
          (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) * 2
        ) DESC, p.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      
      postIds = posts.map(p => p.post_id);
    }

    // Get post details
    const posts = await getPostsDetails(postIds, req.user?.user_id || null);

    return res.status(200).json({
      posts,
      page: parseInt(page),
      limit: parseInt(limit),
      total: posts.length
    });

  } catch (error) {
    Logger.error('getTrendingPosts error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Like or dislike a post
const reactToPost = asyncHandler(async (req, res) => {
  const { post_id, user_id, type } = req.body; // type = 'like' | 'dislike'

  if (!post_id || !user_id || !['like', 'dislike'].includes(type)) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  try {
    // Check if already reacted
    const [existing] = await safeQuery(
      'SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?',
      [post_id, user_id]
    );

    if (existing.length > 0) {
      // Update reaction
      await safeQuery(
        'UPDATE post_likes SET type = ? WHERE post_id = ? AND user_id = ?',
        [type, post_id, user_id]
      );
    } else {
      // Insert new reaction
      await safeQuery(
        'INSERT INTO post_likes (post_id, user_id, type, created_at) VALUES (?, ?, ?, ?)',
        [post_id, user_id, type, new Date()]
      );
    }

    // Update Redis cache
    if (redis.isConnected) {
      // Update trending score
      const scoreChange = type === 'like' ? 1 : -1;
      await redis.zincrby(getTrendingPostsKey(), scoreChange, post_id);
      
      // Invalidate post cache
      await redis.del(getPostCacheKey(post_id));
      
      Logger.info(`Updated Redis for post reaction: ${post_id}`);
    }

    return res.status(200).json({ message: 'Reaction recorded' });
  } catch (error) {
    Logger.error('reactToPost error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get single post with details
const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user?.user_id;

  try {
    // Try to get from cache first
    let post = null;
    if (redis.isConnected) {
      const cached = await redis.get(getPostCacheKey(postId));
      if (cached) {
        post = JSON.parse(cached);
      }
    }

    // If not in cache, get from database
    if (!post) {
      const [posts] = await safeQuery(`
        SELECT 
          p.*, 
          u.name as author_name,
          u.avatar_url as author_avatar,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id AND type = 'like') as likes,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id AND type = 'dislike') as dislikes,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comments_count,
          (SELECT type FROM post_likes WHERE post_id = p.post_id AND user_id = ?) as user_reaction
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.post_id = ?
      `, [userId, postId]);

      post = posts[0];
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // Cache the post
      if (redis.isConnected) {
        await redis.set(getPostCacheKey(postId), JSON.stringify(post), 'EX', 3600);
      }
    }

    // Calculate personalized score if user is logged in
    if (userId) {
      post.personalized_score = await calculatePersonalizedScore(userId, postId, post);
      post.is_following_author = await checkIfFollowing(userId, post.user_id);
    }

    return res.status(200).json(post);
  } catch (error) {
    Logger.error('getPostById error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Update user interests
const updateUserInterests = asyncHandler(async (req, res) => {
  const { user_id, interests } = req.body;

  if (!user_id || !interests || !Array.isArray(interests)) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  try {
    // Delete old interests
    await safeQuery('DELETE FROM user_interests WHERE user_id = ?', [user_id]);

    // Insert new interests
    for (const interest of interests) {
      await safeQuery(
        'INSERT INTO user_interests (user_id, interest, created_at) VALUES (?, ?, ?)',
        [user_id, interest, new Date()]
      );
    }

    // Update Redis cache
    if (redis.isConnected) {
      await redis.del(getUserInterestsKey(user_id));
      await redis.set(getUserInterestsKey(user_id), JSON.stringify(interests), 'EX', 3600);
      
      // Invalidate user's feed to recalculate scores
      await redis.del(getUserFeedKey(user_id));
    }

    return res.status(200).json({ 
      message: 'Interests updated successfully',
      interests 
    });
  } catch (error) {
    Logger.error('updateUserInterests error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get user's feed from Redis (for debugging)
const getFeedFromRedis = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!redis.isConnected) {
    return res.status(503).json({ message: 'Redis not connected' });
  }

  try {
    const feedKey = getUserFeedKey(userId);
    const postIds = await redis.lrange(feedKey, 0, -1);
    
    return res.status(200).json({
      userId,
      feedKey,
      postCount: postIds.length,
      postIds
    });
  } catch (error) {
    Logger.error('getFeedFromRedis error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// Refresh user's feed
const refreshFeed = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    // Delete current feed from Redis
    if (redis.isConnected) {
      await redis.del(getUserFeedKey(userId));
    }

    // Generate new feed
    const [posts] = await safeQuery(`
      SELECT p.post_id 
      FROM posts p
      LEFT JOIN followers f ON p.user_id = f.following_id AND f.follower_id = ?
      WHERE p.user_id = ? OR f.follower_id = ?
      ORDER BY p.created_at DESC
      LIMIT 500
    `, [userId, userId, userId]);

    const postIds = posts.map(p => p.post_id);

    // Update Redis
    if (redis.isConnected) {
      await updateUserFeedInRedis(userId, postIds);
    }

    return res.status(200).json({
      message: 'Feed refreshed successfully',
      postCount: postIds.length
    });
  } catch (error) {
    Logger.error('refreshFeed error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = {
  createPost,
  getPersonalizedFeed,
  getTrendingPosts,
  reactToPost,
  getPostById,
  updateUserInterests,
  getFeedFromRedis,
  refreshFeed,
  // Helper functions for testing
  getUserFeedKey,
  getPostCacheKey
};