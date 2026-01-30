const asyncHandler = require('express-async-handler');
const Logger = require('../utils/logger/logger');
const { safeQuery } = require('../configurations/db'); // your safe query function
const redis = require('../utils/redis/redis'); // your Redis client

const trendingLeaders = asyncHandler(async (req, res) => {
  const redisKey = 'trending:leaders';

  try {
    // 1️⃣ Try to fetch trending leaders from Redis
    const cached = await redis.get(redisKey);
    if (cached) {
      const leaders = JSON.parse(cached);
      return res.status(200).json({
        source: 'redis',
        data: leaders,
      });
    }

    // 2️⃣ Fallback: calculate trending leaders from DB
    // Example: top leaders by number of manifesto engagements
    const sql = `
      SELECT l.leader_id, l.name, COUNT(me.engagement_id) AS engagements
      FROM leaders l
      LEFT JOIN manifestos m ON m.leader_id = l.leader_id
      LEFT JOIN manifesto_engagement me ON me.manifesto_id = m.manifesto_id
      GROUP BY l.leader_id
      ORDER BY engagements DESC
      LIMIT 10
    `;
    const leaders = await safeQuery(sql);

    // 3️⃣ Store result in Redis for 5 minutes
    await redis.setEx(redisKey, 300, JSON.stringify(leaders));

    return res.status(200).json({
      source: 'db',
      data: leaders,
    });
  } catch (error) {
    Logger.error('Error fetching trending leaders', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      message: 'Failed to fetch trending leaders',
    });
  }
});

module.exports = trendingLeaders;
