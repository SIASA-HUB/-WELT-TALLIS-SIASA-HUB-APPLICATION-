const express = require("express");
const router = express.Router();

const {
  uploadSingle,
  processSingleImage,
} = require("../utils/uploder/imageProceesing");

const {
  createRally,
  getAllRallies,
  getUpcomingRallies,
  getRallyById,
  updateRally,
  deleteRally,
  toggleLike,
  toggleAttend,
  getRalliesByParty,
  getRalliesByCounty,
  clearCache,
} = require("../controllers/rallyController");

// Import global auth
let authenticate, authorize, optionalAuth, sanitizeMiddleware;
try {
  const global = require("../../../../global/index");
  authenticate = global.authenticate;
  authorize = global.authorize;
  optionalAuth = global.optionalAuth;
  sanitizeMiddleware = global.sanitizeMiddleware;
  router.use(sanitizeMiddleware);
} catch (e) {
  // Fallback: no-op if global unavailable
  authenticate = (req, res, next) => next();
  authorize = () => (req, res, next) => next();
  optionalAuth = (req, res, next) => next();
  console.warn('[rally-service] Could not load global auth middleware:', e.message);
}

// ===== PUBLIC ROUTES =====
router.get("/", getAllRallies);
router.get("/upcoming", getUpcomingRallies);
router.get("/party/:party", getRalliesByParty);
router.get("/county/:county", getRalliesByCounty);
router.get("/:rallyId", getRallyById);

// ===== PROTECTED ROUTES =====

// Create rally — must be authenticated (aspirant or admin)
router.post("/", authenticate, uploadSingle, processSingleImage, createRally);

// Update rally — auth required (controller should verify ownership)
router.put("/:rallyId", authenticate, uploadSingle, processSingleImage, updateRally);

// Delete rally — admin only
router.delete("/:rallyId", authenticate, authorize("admin"), deleteRally);

// Engagement — requires auth to prevent fake engagement
router.post("/:rallyId/like", authenticate, toggleLike);
router.post("/:rallyId/attend", authenticate, toggleAttend);

// Admin
router.post("/admin/clear-cache", authenticate, authorize("admin"), clearCache);

module.exports = router;
