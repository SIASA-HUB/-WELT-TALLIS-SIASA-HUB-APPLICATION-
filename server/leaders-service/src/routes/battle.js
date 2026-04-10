// routes/battleRoutes.js - Complete Working Version

const express = require("express");
const router = express.Router();
const {
  createBattle,
  getActiveBattles,
  getCompletedBattles,
  getBattleById,
  voteBattle,
  sendGift,
  addReaction,
  getReactions,
  addComment,
  getComments,
  endBattle,
  getBattleLeaderboard,
  getUserVotes,
  getBattleStats,
  countdownTick,

} = require("../controllers/BattleController");

// ================================
// BATTLE ROUTES (ORDER MATTERS!)
// ================================

// Stats & Leaderboard (before ID routes)
router.get("/stats", getBattleStats);
router.get("/leaderboard", getBattleLeaderboard);


// Active & Completed
router.get("/active", getActiveBattles);
router.get("/completed", getCompletedBattles);

// User votes
router.get("/user-votes/:deviceId", getUserVotes);

// Actions (POST)
router.post("/create", createBattle);
router.post("/vote", voteBattle);
router.post("/gift", sendGift);
router.post("/reaction", addReaction);
router.post("/comment", addComment);
router.post("/countdown", countdownTick);

// Battle specific (with ID - MUST be last)
router.get("/:battleId", getBattleById);
router.get("/:battleId/reactions", getReactions);
router.get("/:battleId/comments", getComments);
router.post("/:battleId/end", endBattle);



module.exports = router;