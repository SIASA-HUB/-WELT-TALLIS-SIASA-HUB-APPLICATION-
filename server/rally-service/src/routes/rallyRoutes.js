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

// ===== PUBLIC ROUTES =====

// Query filters: page, limit, status
router.get("/", getAllRallies);

// Upcoming rallies shortcut
router.get("/upcoming", getUpcomingRallies);

// Filters
router.get("/party/:party", getRalliesByParty);
router.get("/county/:county", getRalliesByCounty);

// Single rally (KEEP LAST among GET routes)
router.get("/:rallyId", getRallyById);

// ===== PROTECTED ROUTES =====

// Create rally
router.post("/", uploadSingle, processSingleImage, createRally);

// Update rally
router.put("/:rallyId", uploadSingle, processSingleImage, updateRally);

// Delete rally
router.delete("/:rallyId", deleteRally);

// Engagement
router.post("/:rallyId/like", toggleLike);
router.post("/:rallyId/attend", toggleAttend);

// Admin
router.post("/admin/clear-cache", clearCache);

module.exports = router;
