// routes/leaderRoutes.js - Clean Version

const express = require("express");
const router = express.Router();
const multer = require("multer");

const { processAndSaveImages } = require("../utils/images/imageProcessing");

const {
  createLeader, getLeaderById,registerAspirant,loginAspirant,getMyProfile,
  updateMyProfile,updateLeader, getLeaderStats,
  boostLeader,getPersonalizedFeed,getPopularLeaders,
  getLeaderAnalyticsByCounty,getLeaderAnalyticsByConstituency,
  getLeaderAnalyticsByWard,getLeaderAnalyticsByPosition,getLeaderDashboardAnalytics,
} = require("../controllers/LeaderController");

const {
  createManifesto,
  getTrendingManifestos,
  editManifesto,
  getManifestoByLeaderId,
  getManifestoStats,
  voteOnManifesto,
  deleteManifesto,
} = require("../controllers/ManifestoController");

const { handleInteraction } = require("../controllers/InteractionController");

// Multer config
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  allowedMimes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false);
};

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });
const uploadSingle = upload.single('image');
const uploadMultiple = upload.array('images', 10);

const handleSingleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => err ? res.status(400).json({ success: false, message: err.message }) : next());
};
const handleMultipleUpload = (req, res, next) => {
  uploadMultiple(req, res, (err) => err ? res.status(400).json({ success: false, message: err.message }) : next());
};

// Analytics routes
router.get("/analytics/dashboard", getLeaderDashboardAnalytics);
router.get("/analytics/county", getLeaderAnalyticsByCounty);
router.get("/analytics/constituency", getLeaderAnalyticsByConstituency);
router.get("/analytics/ward", getLeaderAnalyticsByWard);
router.get("/analytics/position", getLeaderAnalyticsByPosition);

// Auth routes
router.post("/register", handleSingleUpload, processAndSaveImages, registerAspirant);
router.post("/login", loginAspirant);

// Manifesto routes
router.post("/manifestos/create", createManifesto);
router.put("/manifestos/:manifestoId", editManifesto);
router.get("/manifestos/leader/:leaderId", getManifestoByLeaderId);
router.post("/manifestos/:manifestoId/vote", voteOnManifesto);
router.get("/manifestos/:manifestoId/stats", getManifestoStats);
router.delete("/manifestos/:manifestoId", deleteManifesto);
router.get("/manifestos/trending", getTrendingManifestos);

// Public routes
router.get("/popular", getPopularLeaders);
router.get("/", getPersonalizedFeed);

// Protected routes
router.post("/:leaderId/boost", boostLeader);
router.get("/:leaderId", getLeaderById);
router.get("/profile/me", getMyProfile);
router.put("/profile/me", updateMyProfile);

// Admin routes
router.post("/create", handleMultipleUpload, processAndSaveImages, createLeader);
router.put("/:leaderId", handleMultipleUpload, processAndSaveImages, updateLeader);
router.post("/interact", handleInteraction);

module.exports = router;