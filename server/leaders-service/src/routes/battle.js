const express = require("express");
const router = express.Router();
const {
  createBattle,
  getActiveBattles,
  getBattleById,
  voteBattle,
  addReaction,
  getReactions,
  addComment,
  getComments,
  endBattle,
  getBattleLeaderboard,
  getUserVotes,
  cleanupExpiredBattles,
  getBattleStats,
} = require("../controllers/BattleController");

// Battle routes
router.post("/create", createBattle);
router.get("/active", getActiveBattles);
router.get("/:battleId", getBattleById);
router.post("/vote", voteBattle);
router.post("/reaction", addReaction);
router.get("/:battleId/reactions", getReactions);
router.post("/comment", addComment);
router.get("/:battleId/comments", getComments);
router.put("/:battleId/end", endBattle);
router.get("/leaderboard", getBattleLeaderboard);
router.get("/user/:deviceId/votes", getUserVotes);
router.get("/stats", getBattleStats);

// Cron job for cleanup (run every hour)
setInterval(
  () => {
    cleanupExpiredBattles();
  },
  60 * 60 * 1000,
); // Every hour

module.exports = router;
