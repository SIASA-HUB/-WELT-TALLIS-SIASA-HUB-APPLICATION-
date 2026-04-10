// routes/endorsementRoutes.js - Clean version with direct imports
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

// Log loaded functions

// Create a new story (text, image, or video)
router.post("/create", createEndorsement);
router.get("/leader/:leaderId/active", getActiveStories);
router.get("/recent", getRecentEndorsements);
router.get("/leader/:leaderId/recent", getRecentEndorsements);
router.get("/leader/:leaderId/boosted", getBoostedEndorsements);

// Get trending stories for a leader
router.get("/leader/:leaderId/trending", getTrendingEndorsements);

// Get leader endorsement stats
router.get("/leader/:leaderId/stats", getLeaderEndorsementStats);
router.post("/:endorsementId/like", likeEndorsement);
// Boost an endorsement (extends story lifetime)
router.post("/:endorsementId/boost", boostEndorsement);

router.post("/:endorsementId/comments", addComment);
router.get("/:endorsementId/comments", getComments);
router.post("/comments/:commentId/like", likeComment);
router.get("/:endorsementId/stats", getEndorsementStats);
router.post("/admin/cleanup", cleanupExpiredStories);
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Endorsement service is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
