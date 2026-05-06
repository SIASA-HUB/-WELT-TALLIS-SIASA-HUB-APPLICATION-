// routes/battleRoutes.js - Complete Working Version (without getTopCreators)

const express = require("express");
const router = express.Router();
const {
  createBattle,
  getActiveBattles,
  getCompletedBattles,
  getBattleById,
  voteBattle,
 
  addReaction,
  getReactions,
  addComment,
  getComments,
  endBattle,
  getBattleLeaderboard,
  getUserVotes,
  getBattleStats,
  countdownTick,
  uploadBattleImage
} = require("../controllers/BattleController");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/battles";
    if (!require("fs").existsSync(dir)) {
      require("fs").mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `battle_${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage });

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
router.post("/reaction", addReaction);
router.post("/comment", addComment);
router.post("/countdown", countdownTick);
router.post("/upload-image", upload.single("image"), uploadBattleImage);

// Battle specific (with ID - MUST be last)
router.get("/:battleId", getBattleById);
router.get("/:battleId/reactions", getReactions);
router.get("/:battleId/comments", getComments);
router.post("/:battleId/end", endBattle);

module.exports = router;