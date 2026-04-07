const express = require("express");
const router = express.Router();
const {
  createEndorsement,
  getRecentEndorsements,
  getBoostedEndorsements,
  getTrendingEndorsements,
  getLeaderEndorsementStats,
  addComment,
  getComments,
  likeComment,
  getEndorsementStats,
  likeEndorsement,
  boostEndorsement,
  getGlobalTrendingEndorsements,
} = require("../controllers/endorsementControl");

// ============================================
// Endorsement Routes
// ============================================

// Create endorsement
router.post("/", createEndorsement);

// Like/unlike endorsement
router.post("/:endorsementId/like", likeEndorsement);

// Boost endorsement
router.post("/:endorsementId/boost", boostEndorsement);

// Get endorsement stats
router.get("/:endorsementId/stats", getEndorsementStats);

// ============================================
// Comment Routes
// ============================================

// Get comments for an endorsement
router.get("/:endorsementId/comments", getComments);

// Add comment to endorsement
router.post("/:endorsementId/comments", addComment);

// Like/unlike a comment
router.post("/comments/:commentId/like", likeComment);

// ============================================
// Leader Endorsement Routes
// ============================================

// Get recent endorsements (most recent first)
// GET /api/v1/endorsements/leader/:leaderId/recent?limit=50
router.get("/leader/:leaderId/recent", getRecentEndorsements);

// Get boosted endorsements (most boosted first)
// GET /api/v1/endorsements/leader/:leaderId/boosted?limit=20
router.get("/leader/:leaderId/boosted", getBoostedEndorsements);

// Get trending endorsements (highest engagement, last 7 days)
// GET /api/v1/endorsements/leader/:leaderId/trending?limit=20&days=7
router.get("/leader/:leaderId/trending", getTrendingEndorsements);

// Get endorsement stats by leader
// GET /api/v1/endorsements/leader/:leaderId/stats
router.get("/leader/:leaderId/stats", getLeaderEndorsementStats);

router.get("/trending/global", getGlobalTrendingEndorsements);

module.exports = router;
