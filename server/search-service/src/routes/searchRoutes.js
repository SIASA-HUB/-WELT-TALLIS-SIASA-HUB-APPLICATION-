// src/routes/searchRoutes.js
const express = require('express');
const router = express.Router();

const {
  recordLeaderSearch,
  getTrendingLeaderSearches,
  getLeaderSearchHistory,
  recordPostSearch,
  getTrendingPostSearches,
  getPostSearchHistory
} = require('../controllers/search'); // adjust path if needed

// ---------------------------
// Leader Searches
// ---------------------------
router.post('/leader', recordLeaderSearch);      // record a leader search
router.get('/leader/trending', getTrendingLeaderSearches);  // top 10 trending leaders
router.get('/leader/history', getLeaderSearchHistory);      // recent 50 leader searches

// ---------------------------
// Post Searches
// ---------------------------
router.post('/post', recordPostSearch);         // record a post search
router.get('/post/trending', getTrendingPostSearches);      // top 10 trending posts
router.get('/post/history', getPostSearchHistory);          // recent 50 post searches

module.exports = router;
