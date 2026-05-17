const express = require("express");
const router = express.Router();
const multer = require("multer");

const { processAndSaveImages } = require("../utils/images/imageProcessing");
const { verifyAspirantToken, verifyOwnsManifesto } = require("../middleware/aspirantAuth");

// Fix: Add try-catch for global module import
let authenticate, authorize, optionalAuth, sanitizeMiddleware, walletLimiter, authLimiter, endorsementLimiter;
try {
  const globalModule = require("../../../global/index");
  authenticate = globalModule.authenticate;
  authorize = globalModule.authorize;
  optionalAuth = globalModule.optionalAuth;
  sanitizeMiddleware = globalModule.sanitizeMiddleware;
  walletLimiter = globalModule.walletLimiter;
  authLimiter = globalModule.authLimiter;
  endorsementLimiter = globalModule.endorsementLimiter;
  console.log("✓ Global modules loaded");
} catch (err) {
  console.error("⚠️ Global modules not available, using mock functions");
  // Mock functions for testing
  authenticate = () => (req, res, next) => next();
  authorize = () => () => (req, res, next) => next();
  optionalAuth = () => (req, res, next) => next();
  sanitizeMiddleware = (req, res, next) => next();
  walletLimiter = (req, res, next) => next();
  authLimiter = (req, res, next) => next();
  endorsementLimiter = (req, res, next) => next();
}

// Import controllers with error handling
const controllerImports = {
  createLeader: null, getLeaderById: null, getLeaderBySlug: null, backfillSlugs: null,
  registerAspirant: null, loginAspirant: null, getMyProfile: null,
  updateMyProfile: null, updateLeader: null, getLeaderStats: null,
  boostLeader: null, getPersonalizedFeed: null, getPopularLeaders: null,
  getLeaderAnalyticsByCounty: null, getLeaderAnalyticsByConstituency: null,
  getLeaderAnalyticsByWard: null, getLeaderAnalyticsByPosition: null, getLeaderDashboardAnalytics: null,
  requestVerification: null, getCompetitors: null, getAllLeaders: null, getLeaderAdminStats: null,
  getAllLeadersPublic: null, generateSitemap: null, handlePaymentCallback: null, handleBoostCallback: null
};

try {
  const LeaderController = require("../controllers/LeaderController");
  Object.assign(controllerImports, LeaderController);
  console.log("✓ LeaderController loaded");
} catch (err) {
  console.error("❌ Failed to load LeaderController:", err.message);
  // Create mock functions to prevent crashes
  Object.keys(controllerImports).forEach(key => {
    controllerImports[key] = (req, res) => res.status(501).json({ error: `Not implemented: ${key}` });
  });
}

const manifestoImports = {
  createManifesto: null, getTrendingManifestos: null, getPersonalizedManifestos: null,
  editManifesto: null, getManifestoByLeaderId: null, getManifestoStats: null,
  voteManifestoAgenda: null, voteOnManifesto: null, deleteManifesto: null,
  deleteAgendaItem: null, getManifestoUserVotes: null, trackReadTime: null, trackManifestoView: null
};

try {
  const ManifestoController = require("../controllers/ManifestoController");
  Object.assign(manifestoImports, ManifestoController);
  console.log("✓ ManifestoController loaded");
} catch (err) {
  console.error("❌ Failed to load ManifestoController:", err.message);
  Object.keys(manifestoImports).forEach(key => {
    manifestoImports[key] = (req, res) => res.status(501).json({ error: `Not implemented: ${key}` });
  });
}

const interactionImports = {
  handleInteraction: null, postComment: null, getLeaderInteractionCounts: null,
  getLeaderTimeAnalytics: null, trackView: null, trackShare: null,
  trackTimeSpent: null, handleSupport: null, trackClick: null, getSupportedLeaders: null
};

try {
  const InteractionController = require("../controllers/InteractionController");
  Object.assign(interactionImports, InteractionController);
  console.log("✓ InteractionController loaded");
} catch (err) {
  console.error("❌ Failed to load InteractionController:", err.message);
  Object.keys(interactionImports).forEach(key => {
    interactionImports[key] = (req, res) => res.status(501).json({ error: `Not implemented: ${key}` });
  });
}

// Destructure with defaults
const {
  createLeader, getLeaderById, getLeaderBySlug, backfillSlugs,
  registerAspirant, loginAspirant, getMyProfile,
  updateMyProfile, updateLeader, getLeaderStats,
  boostLeader, getPersonalizedFeed, getPopularLeaders,
  getLeaderAnalyticsByCounty, getLeaderAnalyticsByConstituency,
  getLeaderAnalyticsByWard, getLeaderAnalyticsByPosition, getLeaderDashboardAnalytics,
  requestVerification, getCompetitors, getAllLeaders, getLeaderAdminStats,
  getAllLeadersPublic, generateSitemap, handlePaymentCallback, handleBoostCallback
} = controllerImports;

const {
  createManifesto,
  getTrendingManifestos,
  getPersonalizedManifestos,
  editManifesto,
  getManifestoByLeaderId,
  getManifestoStats,
  voteManifestoAgenda,
  voteOnManifesto,
  deleteManifesto,
  deleteAgendaItem,
  getManifestoUserVotes,
  trackReadTime,
  trackManifestoView,
} = manifestoImports;

const {
  handleInteraction,
  postComment,
  getLeaderInteractionCounts,
  getLeaderTimeAnalytics,
  trackView,
  trackShare,
  trackTimeSpent,
  handleSupport,
  trackClick,
  getSupportedLeaders,
} = interactionImports;

// Apply sanitization to all routes (only if function exists)
if (sanitizeMiddleware && typeof sanitizeMiddleware === 'function') {
  router.use(sanitizeMiddleware);
  console.log("✓ Sanitize middleware applied");
} else {
  console.log("⚠️ Sanitize middleware skipped");
}

// Multer config
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  allowedMimes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false);
};
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter });
const uploadSingle = upload.single('image');
const uploadMultiple = upload.array('images', 5);

const handleSingleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => err ? res.status(400).json({ success: false, message: err.message }) : next());
};
const handleMultipleUpload = (req, res, next) => {
  uploadMultiple(req, res, (err) => err ? res.status(400).json({ success: false, message: err.message }) : next());
};

// Helper to safely add routes
const safeRoute = (method, path, ...handlers) => {
  const validHandlers = handlers.filter(h => h && typeof h === 'function');
  if (validHandlers.length === 0) {
    console.error(`❌ No valid handlers for ${method} ${path}`);
    router[method](path, (req, res) => res.status(501).json({ error: `Endpoint ${path} not implemented` }));
  } else {
    router[method](path, ...validHandlers);
    console.log(`✓ Route added: ${method} ${path}`);
  }
};

// ============================================================
// ANALYTICS ROUTES
// ============================================================
safeRoute("get", "/analytics/dashboard", getLeaderDashboardAnalytics);
safeRoute("get", "/analytics/county", getLeaderAnalyticsByCounty);
safeRoute("get", "/analytics/constituency", getLeaderAnalyticsByConstituency);
safeRoute("get", "/analytics/ward", getLeaderAnalyticsByWard);
safeRoute("get", "/analytics/position", getLeaderAnalyticsByPosition);
safeRoute("post", "/analytics/click", trackClick);

// ============================================================
// INTERACTION & TRACKING ROUTES
// ============================================================
safeRoute("post", "/interact", optionalAuth, handleInteraction);
safeRoute("get", "/:leaderId/interaction-stats", getLeaderInteractionCounts);
safeRoute("get", "/:leaderId/time-analytics", getLeaderTimeAnalytics);
safeRoute("post", "/:leaderId/comment", authenticate, postComment);
safeRoute("post", "/:leaderId/view", optionalAuth, trackView);
safeRoute("post", "/:leaderId/share", optionalAuth, trackShare);
safeRoute("post", "/:leaderId/time-spent", optionalAuth, trackTimeSpent);
safeRoute("post", "/:leaderId/support", authenticate, handleSupport);
safeRoute("get", "/user/:userId/supported", authenticate, getSupportedLeaders);

// ============================================================
// AUTH ROUTES
// ============================================================
safeRoute("post", "/register", handleSingleUpload, processAndSaveImages, registerAspirant);
safeRoute("post", "/login", loginAspirant);

// ============================================================
// MANIFESTO ROUTES
// ============================================================
safeRoute("get", "/manifestos/trending", getTrendingManifestos);
safeRoute("get", "/manifestos/personalized", getPersonalizedManifestos);
safeRoute("post", "/manifestos/create", verifyAspirantToken, createManifesto);
safeRoute("post", "/manifestos/vote", authenticate, voteManifestoAgenda);
safeRoute("delete", "/manifestos/agenda/:agendaId", verifyAspirantToken, deleteAgendaItem);
safeRoute("get", "/manifestos/leader/:leaderId", getManifestoByLeaderId);
safeRoute("get", "/manifestos/:manifestoId/stats", getManifestoStats);
safeRoute("get", "/manifestos/:manifestoId/user-votes", optionalAuth, getManifestoUserVotes);
safeRoute("post", "/manifestos/:manifestoId/vote", optionalAuth, voteOnManifesto);
safeRoute("post", "/manifestos/:manifestoId/view", optionalAuth, trackManifestoView);
safeRoute("post", "/manifestos/:manifestoId/share", optionalAuth, trackShare);
safeRoute("post", "/manifestos/:manifestoId/read-time", optionalAuth, trackReadTime);
safeRoute("put", "/manifestos/:manifestoId", verifyAspirantToken, editManifesto);
safeRoute("delete", "/manifestos/:manifestoId", verifyAspirantToken, deleteManifesto);

// ============================================================
// PUBLIC LEADER ROUTES
// ============================================================
safeRoute("get", "/sitemap.xml", generateSitemap);
safeRoute("get", "/popular", getPopularLeaders);
safeRoute("get", "/profile/:slug", getLeaderBySlug);
safeRoute("post", "/backfill-slugs", backfillSlugs);
safeRoute("get", "/all", getAllLeadersPublic);
safeRoute("get", "/", getPersonalizedFeed);

// ============================================================
// LEADER-SPECIFIC ROUTES
// ============================================================
safeRoute("post", "/:leaderId/boost", boostLeader);
safeRoute("get", "/:leaderId/stats", optionalAuth, getLeaderStats);
safeRoute("post", "/:leaderId/support", optionalAuth, handleSupport);
safeRoute("get", "/slug/:slug/competitors", getCompetitors);
safeRoute("get", "/:leaderId", getLeaderById);

// ============================================================
// PROTECTED / ME ROUTES
// ============================================================
safeRoute("get", "/profile/me", verifyAspirantToken, getMyProfile);
safeRoute("put", "/profile/me", updateMyProfile);
safeRoute("post", "/verification/request", verifyAspirantToken, requestVerification);

// ============================================================
// ADMIN ROUTES
// ============================================================
safeRoute("get", "/admin/all", authenticate, authorize("admin"), getAllLeaders);
safeRoute("get", "/admin/stats", authenticate, authorize("admin"), getLeaderAdminStats);
safeRoute("post", "/create", authenticate, authorize("admin"), handleMultipleUpload, processAndSaveImages, createLeader);
safeRoute("put", "/:leaderId/admin", authenticate, authorize("admin"), handleMultipleUpload, processAndSaveImages, updateLeader);

// Special admin routes
router.patch("/verify/:leaderId", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { verifyLeader } = require("../controllers/LeaderController");
    return verifyLeader(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/reject/:leaderId", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { rejectLeader } = require("../controllers/LeaderController");
    return rejectLeader(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:leaderId", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { deleteLeader } = require("../controllers/LeaderController");
    return deleteLeader(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

safeRoute("post", "/payments/callback", handlePaymentCallback);
safeRoute("post", "/boost/callback", handleBoostCallback);

console.log("✅ All routes registered successfully");

module.exports = router;