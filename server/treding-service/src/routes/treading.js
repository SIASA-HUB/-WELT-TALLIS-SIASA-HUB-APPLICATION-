const express = require('express');
const router = express.Router(); // <-- fixed typo

const trendingLeaders = require('../controllers/treading'); // make sure path is correct

// Route for trending leaders
router.get('/trending', trendingLeaders);

module.exports = router;
