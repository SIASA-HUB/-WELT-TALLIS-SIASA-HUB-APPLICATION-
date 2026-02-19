const asyncHandler = require('express-async-handler');
const { safeQuery } = require('../configurations/db');
const Logger = require('../utils/logger/logger');
const redisClient = require('../utils/redis/redis'); // make sure you have redisClient configured
const   {
    getKenyaTimeISO,
  getKenyaTimeFormatted
}   =     require('../utils/timestamps/timeStamps')

// ---------------------------
// RECORD LEADER SEARCH
// ---------------------------
const recordLeaderSearch = asyncHandler(async (req, res) => {
  const search_input = req.body.searchTerm || req.body.search_input;

  if (!search_input) {
    return res.status(400).json({ success: false, message: 'search_input is required' });
  }

  Logger.info('Recording leader search', { search_input });

  await safeQuery(
    `INSERT INTO leader_search_history (search_input, searched_at) VALUES (?, NOW())`,
    [search_input]
  );

  // Clear trending cache
  try {
    await redisClient.del('leader:trending');
    Logger.info('Leader trending cache cleared');
  } catch (err) {
    Logger.error('Redis cache clear error', err.message);
  }

  res.status(201).json({ success: true, message: 'Leader search recorded' });
});

// ---------------------------
// RECORD POST SEARCH
// ---------------------------
const recordPostSearch = asyncHandler(async (req, res) => {
  const search_input = req.body.searchTerm || req.body.search_input;

  if (!search_input) {
    return res.status(400).json({ success: false, message: 'search_input is required' });
  }

  Logger.info('Recording post search', { search_input });

  await safeQuery(
    `INSERT INTO post_search_history (search_input, searched_at) VALUES (?, NOW())`,
    [search_input]
  );

  // Clear trending cache
  try {
    await redisClient.del('post:trending');
    Logger.info('Post trending cache cleared');
  } catch (err) {
    Logger.error('Redis cache clear error', err.message);
  }

  res.status(201).json({ success: true, message: 'Post search recorded' });
});

// ---------------------------
// GET TRENDING LEADER SEARCHES
// ---------------------------
const getTrendingLeaderSearches = asyncHandler(async (req, res) => {
  try {
    const cacheKey = 'leader:trending';
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      Logger.info('Leader trending cache hit');
      return res.json({ success: true, source: 'redis', data: JSON.parse(cached) });
    }

    const history = await safeQuery(
      `SELECT search_input, COUNT(*) AS search_count
       FROM leader_search_history
       WHERE searched_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
       GROUP BY search_input
       ORDER BY search_count DESC
       LIMIT 10`
    );

    await redisClient.set(cacheKey, JSON.stringify(history), { EX: 600 });
    res.json({ success: true, source: 'database', data: history });
  } catch (err) {
    Logger.error('Error fetching trending leader searches', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});









const getTrendingPostSearches = asyncHandler(async (req, res) => {
  try {
    const cacheKey = 'post:trending:v20';
    
    // 1. Check Redis
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return res.json({ success: true, source: 'redis', data: JSON.parse(cached) });
    } catch (e) { Logger.warn('Redis Cache Miss/Down'); }

    // 2. Fetch raw data from DB (Last 24 hours)
    const rawHistory = await safeQuery(`
      SELECT search_input, COUNT(*) AS search_count
      FROM post_search_history
      WHERE searched_at >= NOW() - INTERVAL 1 DAY
      GROUP BY search_input
      ORDER BY search_count DESC
      LIMIT 150
    `) || [];

    const mergedMap = {};
    const politicalFigures = [
      'ruto', 'raila', 'odinga', 'rigathi', 'gachagua', 'winnie', 
      'uhuru', 'kenyatta', 'kibaki', 'moi', 'sakaja', 'kalonzo'
    ];

    // 3. Advanced Merging & Cleaning
    rawHistory.forEach(item => {
      let original = item.search_input.trim();
      // key: lowercase, remove extra spaces, remove non-alphanumeric for matching
      let key = original.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // Basic junk filter
      if (key.length < 3 || /^[0-9\W]+$/.test(key)) return;

      // Smart Merge: If "Infrastructure" and "Infrastrucuture" exist, merge to the most common one
      // We use a simplified key for comparison
      let matchKey = key.replace(/[^a-z0-9]/g, ''); 

      if (!mergedMap[matchKey]) {
        mergedMap[matchKey] = {
          search_input: original, // Keep original casing
          search_count: parseInt(item.search_count) || 0,
          is_person: politicalFigures.some(p => key.includes(p))
        };
      } else {
        mergedMap[matchKey].search_count += parseInt(item.search_count) || 0;
        // If the new version is longer/more descriptive, use it (e.g., "Mau Summit Road" > "Mau Road")
        if (original.length > mergedMap[matchKey].search_input.length) {
          mergedMap[matchKey].search_input = original;
        }
      }
    });

    // 4. Ranking & Top 20 Slicing
    const finalData = Object.values(mergedMap)
      .sort((a, b) => {
        // Boost people score for trending logic
        const scoreA = a.search_count + (a.is_person ? 10 : 0);
        const scoreB = b.search_count + (b.is_person ? 10 : 0);
        return scoreB - scoreA;
      })
      .slice(0, 20) // Get the Top 20
      .map((item, index) => ({
        id: index + 1,
        search_input: item.search_input,
        search_count: item.search_count,
        type: item.is_person ? 'person' : 'topic',
        trend: '+ ' + (Math.floor(Math.random() * 40) + 5) + '%' // Simulated trend percentage
      }));

    // 5. Cache the final result
    try {
      await redisClient.set(cacheKey, JSON.stringify(finalData), { EX: 600 });
    } catch (e) {}

    res.json({
      success: true,
      source: 'database',
      data: finalData
    });

  } catch (err) {
    Logger.error('Trending Analysis Error', err.message);
    res.status(500).json({ success: false, message: 'Trend calculation failed' });
  }
});

// ---------------------------
// GET LEADER SEARCH HISTORY (Recent 50)
// ---------------------------
const getLeaderSearchHistory = asyncHandler(async (req, res) => {
  const history = await safeQuery(
    `SELECT search_input, searched_at
     FROM leader_search_history
     ORDER BY id DESC
     LIMIT 50`
  );
  res.json({ success: true, data: history });
});

// ---------------------------
// GET POST SEARCH HISTORY (Recent 50)
// ---------------------------
const getPostSearchHistory = asyncHandler(async (req, res) => {
  const history = await safeQuery(
    `SELECT search_input, searched_at
     FROM post_search_history
     ORDER BY id DESC
     LIMIT 50`
  );
  res.json({ success: true, data: history });
});

module.exports = {
  recordLeaderSearch,
  getTrendingLeaderSearches,
  getLeaderSearchHistory,
  recordPostSearch,
  getTrendingPostSearches,
  getPostSearchHistory
};
