// routes/endorsementRoutes.js - Clean version with correct paths
const express = require("express");
const router = express.Router();

// Direct import of all controller functions
const {
  createEndorsement,
  getActiveStories,
  getRecentEndorsements,
  getBoostedEndorsements,
  getTrendingEndorsements,
  likeEndorsement,
  boostEndorsement,
  getLeaderEndorsementStats,
  cleanupExpiredStories,
  addComment,
  getComments,
  likeComment,
  getEndorsementStats,
} = require("../controllers/endorsementControl");

// ============================================
// ENDORSEMENT/STORIES ROUTES
// ============================================

// Create a new story (text, image, or video)
router.post("/create", createEndorsement);

// Get active stories for a leader
router.get("/leader/:leaderId/active", getActiveStories);

// Get recent endorsements (global or by leader)
router.get("/recent", getRecentEndorsements);
router.get("/leader/:leaderId/recent", getRecentEndorsements);

// Get boosted endorsements for a leader
router.get("/leader/:leaderId/boosted", getBoostedEndorsements);

// Get trending stories for a leader
router.get("/leader/:leaderId/trending", getTrendingEndorsements);

// Get leader endorsement stats
router.get("/leader/:leaderId/stats", getLeaderEndorsementStats);

// Like/unlike an endorsement
router.post("/:endorsementId/like", likeEndorsement);

// Boost an endorsement (extends story lifetime)
router.post("/:endorsementId/boost", boostEndorsement);

// Comments routes
router.post("/:endorsementId/comments", addComment);
router.get("/:endorsementId/comments", getComments);
router.post("/comments/:commentId/like", likeComment);

// Get endorsement stats
router.get("/:endorsementId/stats", getEndorsementStats);

// Admin routes
router.post("/admin/cleanup", cleanupExpiredStories);

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Endorsement service is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;