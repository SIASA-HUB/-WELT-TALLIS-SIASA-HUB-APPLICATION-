const asyncHandler = require('express-async-handler');
const Logger = require('../utils/logger/logger');
const redisClient = require('../utils/redis/redis');
const { v4: uuidv4 } = require('uuid');
const { safeQuery, safeQueryOne } = require('../configurations/db');

// Helpers
const generatePostId = () => `post_${uuidv4()}`;
const getUserFeedKey = (userId) => `user:${userId}:feed`;
const getTrendingPostsKey = () => 'trending:posts';
const getPostCacheKey = (postId) => `post:${postId}`;

// ================= REDIS SYNC LOGIC =================

async function updateRedisAfterPostCreation(postData) {
  try {
    const isRedisConnected = redisClient.client && redisClient.client.status === 'ready';
    if (!isRedisConnected) return;

    const { post_id, user_id } = postData;

    // 1. Cache individual post (1 hour)
    await redisClient.set(getPostCacheKey(post_id), JSON.stringify(postData), { EX: 3600 });

    // 2. Add to trending (ZSET)
    await redisClient.zadd(getTrendingPostsKey(), 0, post_id);

    // 3. Update Creator's Feed
    const myFeedKey = getUserFeedKey(user_id);
    await redisClient.lpush(myFeedKey, post_id);
    await redisClient.ltrim(myFeedKey, 0, 499);

    // 4. Update Followers (Async)
    addPostToFollowersFeeds(user_id, post_id);

    Logger.info(`[RedisSync] Success for post: ${post_id}`);
  } catch (error) {
    Logger.error('[RedisSync] Error:', error);
  }
}

async function addPostToFollowersFeeds(userId, postId) {
  try {
    const followers = await safeQuery('SELECT follower_id FROM followers WHERE following_id = ?', [userId]);
    if (!followers || followers.length === 0) return;

    for (const f of followers) {
      const feedKey = getUserFeedKey(f.follower_id);
      const exists = await redisClient.exists(feedKey);
      if (exists) {
        await redisClient.lpush(feedKey, postId);
        await redisClient.ltrim(feedKey, 0, 499);
      }
    }
  } catch (err) {
    Logger.error('[FollowerSync] Error:', err);
  }
}

// ================= CORE FETCH LOGIC =================

async function getPostsFromCacheOrDB(postIds) {
  if (!postIds || postIds.length === 0) return [];
  
  const posts = [];
  const uncachedIds = [];
  const isRedisConnected = redisClient.client && redisClient.client.status === 'ready';

  // 1. Try Cache
  if (isRedisConnected) {
    for (const id of postIds) {
      const data = await redisClient.get(getPostCacheKey(id));
      if (data) posts.push(JSON.parse(data));
      else uncachedIds.push(id);
    }
  } else {
    uncachedIds.push(...postIds);
  }

  // 2. Load Missing from DB
  if (uncachedIds.length > 0) {
    const placeholders = uncachedIds.map(() => '?').join(',');
    const dbPosts = await safeQuery(`
      SELECT p.*, u.anonymous_username as author_name,
      (SELECT COUNT(*) FROM post_reactions WHERE post_id = p.post_id AND reaction = 'like') as likes,
      (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.post_id IN (${placeholders})
    `, uncachedIds);

    for (const post of dbPosts) {
      if (isRedisConnected) {
        await redisClient.set(getPostCacheKey(post.post_id), JSON.stringify(post), { EX: 3600 });
      }
      posts.push(post);
    }
  }

  return postIds.map(id => posts.find(p => p.post_id === id)).filter(Boolean);
}

// ================= CONTROLLERS =================

const createPost = asyncHandler(async (req, res) => {
  const { user_id, title, description, rally_time } = req.body;

  if (!user_id || !title || !description) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Use anonymous_username instead of name
  const user = await safeQueryOne('SELECT anonymous_username FROM users WHERE user_id = ?', [user_id]);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const post_id = generatePostId();
  const image_urls = req.body.image?.url || (req.body.images?.length > 0 ? req.body.images[0].url : null);

  // Persist to DB
  await safeQuery(`
    INSERT INTO posts (post_id, user_id, title, description, image_url, rally_time, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, [post_id, user_id, title.trim(), description.trim(), image_urls, rally_time || null]);

  const postData = {
    post_id, user_id, title, description, image_url: image_urls,
    author_name: user.anonymous_username,
    likes: 0, comments_count: 0, created_at: new Date()
  };

  updateRedisAfterPostCreation(postData);

  res.status(201).json({ success: true, post: postData });
});

const getPersonalizedFeed = asyncHandler(async (req, res) => {
  const userId = req.params.userId || req.user?.user_id;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  const isRedisConnected = redisClient.client && redisClient.client.status === 'ready';
  let postIds = [];

  if (isRedisConnected) {
    postIds = await redisClient.lrange(getUserFeedKey(userId), offset, offset + limit - 1);
  }

  if (postIds.length === 0) {
    const dbRows = await safeQuery(`
      SELECT p.post_id FROM posts p
      LEFT JOIN followers f ON p.user_id = f.following_id AND f.follower_id = ?
      WHERE p.user_id = ? OR f.follower_id = ?
      ORDER BY p.created_at DESC LIMIT ? OFFSET ?
    `, [userId, userId, userId, limit, offset]);

    postIds = dbRows.map(r => r.post_id);

    if (page === 1 && isRedisConnected && postIds.length > 0) {
        const allIds = await safeQuery(`SELECT post_id FROM posts ORDER BY created_at DESC LIMIT 100`);
        const ids = allIds.map(r => r.post_id);
        await redisClient.del(getUserFeedKey(userId));
        await redisClient.lpush(getUserFeedKey(userId), ...ids.reverse());
        await redisClient.expire(getUserFeedKey(userId), 3600);
    }
  }

  const posts = await getPostsFromCacheOrDB(postIds);
  res.json({ success: true, posts, page, source: postIds.length > 0 ? 'hybrid' : 'db' });
});

const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await safeQuery('SELECT * FROM posts ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, posts });
});

module.exports = { createPost, getPersonalizedFeed, getAllPosts };
