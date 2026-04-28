const express = require("express");
const router = express.Router();
const multer = require("multer");

const { processAndSaveImages } = require("../utils/images/imageProcessing");
const { verifyAspirantToken, verifyOwnsManifesto } = require("../middleware/aspirantAuth");
const {
  authenticate,
  authorize,
  optionalAuth,
  sanitizeMiddleware,
  walletLimiter,
  authLimiter,
  endorsementLimiter,
} = require("../../../global/index");

const {
  createLeader, getLeaderById, getLeaderBySlug, backfillSlugs,
  registerAspirant, loginAspirant, getMyProfile,
  updateMyProfile, updateLeader, getLeaderStats,
  boostLeader, getPersonalizedFeed, getPopularLeaders,
  getLeaderAnalyticsByCounty, getLeaderAnalyticsByConstituency,
  getLeaderAnalyticsByWard, getLeaderAnalyticsByPosition, getLeaderDashboardAnalytics,
  requestVerification, getCompetitors, getAllLeaders, getLeaderAdminStats,
  getAllLeadersPublic, generateSitemap,
} = require("../controllers/LeaderController");

const {
  createManifesto,
  getTrendingManifestos,
  getPersonalizedManifestos,
  updateManifesto: editManifesto,
  getManifestoByLeaderId,
  getManifestoStats,
  voteManifestoAgenda,
  voteOnManifesto,
  deleteManifesto,
  deleteAgendaItem,
  getManifestoUserVotes,
  trackReadTime,
  trackManifestoView,

} = require("../controllers/ManifestoController");

const {
  handleInteraction,
  postComment,
  getLeaderInteractionCounts,
  getLeaderTimeAnalytics,
  trackView,
  trackShare,
  trackTimeSpent,
  handleSupport,
} = require("../controllers/InteractionController");

// Apply sanitization to all routes
router.use(sanitizeMiddleware);

// Multer config
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  allowedMimes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false);
};
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }); // reduced to 5MB
const uploadSingle = upload.single('image');
const uploadMultiple = upload.array('images', 5); // max 5 images

const handleSingleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => err ? res.status(400).json({ success: false, message: err.message }) : next());
};
const handleMultipleUpload = (req, res, next) => {
  uploadMultiple(req, res, (err) => err ? res.status(400).json({ success: false, message: err.message }) : next());
};

// ============================================================
// ANALYTICS ROUTES
// ============================================================
router.get("/analytics/dashboard", getLeaderDashboardAnalytics);
router.get("/analytics/county", getLeaderAnalyticsByCounty);
router.get("/analytics/constituency", getLeaderAnalyticsByConstituency);
router.get("/analytics/ward", getLeaderAnalyticsByWard);
router.get("/analytics/position", getLeaderAnalyticsByPosition);

// ============================================================
// INTERACTION & TRACKING ROUTES (NEW)
// ============================================================

router.post("/interact", optionalAuth, handleInteraction);
router.get("/:leaderId/interaction-stats", getLeaderInteractionCounts);

// Get detailed time analytics for a leader
router.get("/:leaderId/time-analytics", getLeaderTimeAnalytics);
router.post("/:leaderId/comment", authenticate, postComment);

// Specialized interaction tracking routes
router.post("/:leaderId/view", optionalAuth, trackView);
router.post("/:leaderId/share", optionalAuth, trackShare);
router.post("/:leaderId/time-spent", optionalAuth, trackTimeSpent);

// ============================================================
// AUTH ROUTES
// ============================================================
router.post("/register", handleSingleUpload, processAndSaveImages, registerAspirant);
router.post("/login", loginAspirant);

// ============================================================
// MANIFESTO ROUTES (all specific paths BEFORE /:manifestoId)
// ============================================================

router.get("/manifestos/trending", getTrendingManifestos);
router.get("/manifestos/personalized", getPersonalizedManifestos);
router.post("/manifestos/create", verifyAspirantToken, createManifesto); // aspirants only


router.post("/manifestos/vote", authenticate, voteManifestoAgenda);

// Delete agenda item — aspirant (owner) only
router.delete("/manifestos/agenda/:agendaId", verifyAspirantToken, deleteAgendaItem);

// CRUD with :manifestoId
router.get("/manifestos/leader/:leaderId", getManifestoByLeaderId);
router.get("/manifestos/:manifestoId/stats", getManifestoStats);
router.get("/manifestos/:manifestoId/user-votes", optionalAuth, getManifestoUserVotes);
router.post("/manifestos/:manifestoId/vote", optionalAuth, voteOnManifesto);
router.post("/manifestos/:manifestoId/view", optionalAuth, trackManifestoView);
router.post("/manifestos/:manifestoId/share", optionalAuth, trackShare);
router.post("/manifestos/:manifestoId/read-time", optionalAuth, trackReadTime);
router.put("/manifestos/:manifestoId", verifyAspirantToken, editManifesto); // aspirants only
router.delete("/manifestos/:manifestoId", verifyAspirantToken, deleteManifesto); // aspirants only

// ============================================================
// PUBLIC LEADER ROUTES
// ============================================================
router.get("/sitemap.xml", generateSitemap);
router.get("/popular", getPopularLeaders);
router.get("/profile/:slug", getLeaderBySlug);
router.post("/backfill-slugs", backfillSlugs);
router.get("/all", getAllLeadersPublic);
router.get("/", getPersonalizedFeed);

// ============================================================
// LEADER-SPECIFIC ROUTES
// ============================================================
router.post("/:leaderId/boost", boostLeader);
router.get("/:leaderId/stats", optionalAuth, getLeaderStats);
router.post("/:leaderId/support", optionalAuth, handleSupport);
router.get("/:leaderId/competitors", getCompetitors);
router.get("/:leaderId", getLeaderById);

// ============================================================
// PROTECTED / ME ROUTES — aspirant only
// ============================================================
router.get("/profile/me", verifyAspirantToken, getMyProfile);
router.put("/profile/me", verifyAspirantToken, updateMyProfile);
router.post("/verification/request", verifyAspirantToken, requestVerification);

// ============================================================
// ADMIN ROUTES — admin role required
// ============================================================
router.get("/admin/all", authenticate, authorize("admin"), getAllLeaders);
router.get("/admin/stats", authenticate, authorize("admin"), getLeaderAdminStats);
router.post("/create", authenticate, authorize("admin"), handleMultipleUpload, processAndSaveImages, createLeader);
router.put("/:leaderId/admin", authenticate, authorize("admin"), handleMultipleUpload, processAndSaveImages, updateLeader);
router.patch("/verify/:leaderId", authenticate, authorize("admin"), async (req, res) => {
  const { verifyLeader } = require("../controllers/LeaderController");
  return verifyLeader(req, res);
});
router.patch("/reject/:leaderId", authenticate, authorize("admin"), async (req, res) => {
  const { rejectLeader } = require("../controllers/LeaderController");
  return rejectLeader(req, res);
});
router.delete("/:leaderId", authenticate, authorize("admin"), async (req, res) => {
  const { deleteLeader } = require("../controllers/LeaderController");
  return deleteLeader(req, res);
});

module.exports = router;
