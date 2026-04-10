const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  uploadMultiple,
  uploadSingle,
  processAndUploadImages,
} = require("../utils/images/imageProcessing");

const {
  createLeader,
  getLeaderById,
  registerAspirant,
  loginAspirant,
  getMyProfile,
  updateMyProfile,
  searchLeaders,
  getLeadersByParty,
  getLeadersByCounty,
  getLeadersByConstituency,
  getLeadersByWard,
  updateLeader,
  getPersonalizedFeed,
  deleteLeader,
  getLeaderStats,
  getPopularLeaders,
  boostLeader,
  getFeaturedLeaders,
  // Analytics exports
  getLeaderAnalyticsByCounty,
  getLeaderAnalyticsByConstituency,
  getLeaderAnalyticsByWard,
  getLeaderAnalyticsByPosition,
  getLeaderDashboardAnalytics,
} = require("../controllers/LeaderContrloller");

const {
  createManifesto,
  getTrendingManifestos,
  editManifesto,
  getManifestoByLeaderId,
  getManifestoStats,
  voteOnManifesto,
  deleteManifesto,
} = require("../controllers/manifesto");

const {
  handleInteraction,
} = require("../controllers/leaderInteractionController");

// ================================
// LEADER ANALYTICS ROUTES (Admin only - PUT THESE FIRST)
// ================================

/**
 * @route   GET /api/v1/leaders/analytics/dashboard
 * @desc    Get complete leader dashboard analytics
 * @access  Admin only
 */
router.get("/analytics/dashboard", getLeaderDashboardAnalytics);

/**
 * @route   GET /api/v1/leaders/analytics/county
 * @desc    Get leader analytics by county (Presidential, Governors, Senators, MPs, MCAs, Women Reps)
 * @access  Admin only
 */
router.get("/analytics/county", getLeaderAnalyticsByCounty);

/**
 * @route   GET /api/v1/leaders/analytics/constituency
 * @desc    Get leader analytics by constituency (MPs, MCAs per constituency)
 * @query   ?county=xxx (optional filter by county)
 * @access  Admin only
 */
router.get("/analytics/constituency", getLeaderAnalyticsByConstituency);

/**
 * @route   GET /api/v1/leaders/analytics/ward
 * @desc    Get leader analytics by ward (MCAs per ward)
 * @query   ?constituency=xxx or ?county=xxx (optional filters)
 * @access  Admin only
 */
router.get("/analytics/ward", getLeaderAnalyticsByWard);

/**
 * @route   GET /api/v1/leaders/analytics/position
 * @desc    Get leader analytics by position category
 * @access  Admin only
 */
router.get("/analytics/position", getLeaderAnalyticsByPosition);

// ================================
// ASPIRANT ONBOARDING & AUTH (PUBLIC)
// ================================

/**
 * @route   POST /api/v1/leaders/register
 * @desc    Self-registration for new aspirants (Single file upload)
 */
router.post(
  "/register",
  uploadSingle,
  processAndUploadImages,
  registerAspirant,
);

/**
 * @route   POST /api/v1/leaders/login
 * @desc    Login for aspirants
 */
router.post("/login", loginAspirant);

// ================================
// MANIFESTOS ROUTES (ALL SPECIFIC ROUTES FIRST)
// ================================

/**
 * @route   POST /api/v1/leaders/manifestos/create
 * @desc    Create a new manifesto
 */
router.post("/manifestos/create", createManifesto);

/**
 * @route   PUT /api/v1/leaders/manifestos/:manifestoId
 * @desc    Edit an existing manifesto
 */
router.put("/manifestos/:manifestoId", editManifesto);

/**
 * @route   GET /api/v1/leaders/manifestos/leader/:leaderId
 * @desc    Get manifesto by leader ID
 */
router.get("/manifestos/leader/:leaderId", getManifestoByLeaderId);

/**
 * @route   POST /api/v1/leaders/manifestos/:manifestoId/vote
 * @desc    Vote on a manifesto
 */
router.post("/manifestos/:manifestoId/vote", voteOnManifesto);

/**
 * @route   GET /api/v1/leaders/manifestos/:manifestoId/stats
 * @desc    Get manifesto statistics
 */
router.get("/manifestos/:manifestoId/stats", getManifestoStats);

/**
 * @route   DELETE /api/v1/leaders/manifestos/:manifestoId
 * @desc    Delete a manifesto
 */
router.delete("/manifestos/:manifestoId", deleteManifesto);

/**
 * @route   GET /api/v1/leaders/manifestos/trending
 * @desc    Get trending manifestos
 */
router.get("/manifestos/trending", getTrendingManifestos);

// ================================
// LEADERS PUBLIC ROUTES (SPECIFIC PATHS BEFORE PARAMETERS)
// ================================

/**
 * @route   GET /api/v1/leaders/search
 * @desc    Search leaders by name, party, position, etc.
 */
router.get("/search", searchLeaders);

/**
 * @route   GET /api/v1/leaders/featured
 * @desc    Get featured leaders
 */
router.get("/featured", getFeaturedLeaders);

/**
 * @route   GET /api/v1/leaders/popular
 * @desc    Get popular leaders (most boosted)
 */
router.get("/popular", getPopularLeaders);

/**
 * @route   GET /api/v1/leaders/party/:party
 * @desc    Get leaders by political party
 */
router.get("/party/:party", getLeadersByParty);

/**
 * @route   GET /api/v1/leaders/county/:county
 * @desc    Get leaders by county
 */
router.get("/county/:county", getLeadersByCounty);

/**
 * @route   GET /api/v1/leaders/constituency/:constituency
 * @desc    Get leaders by constituency
 */
router.get("/constituency/:constituency", getLeadersByConstituency);

/**
 * @route   GET /api/v1/leaders/ward/:ward
 * @desc    Get leaders by ward
 */
router.get("/ward/:ward", getLeadersByWard);

/**
 * @route   GET /api/v1/leaders/
 * @desc    Get personalized feed (all leaders with ranking)
 */
router.get("/", getPersonalizedFeed);

// ================================
// ROUTES WITH PARAMETERS (PUT THESE LAST)
// ================================

/**
 * @route   POST /api/v1/leaders/:leaderId/boost
 * @desc    Boost a leader (deduct from wallet)
 */
router.post("/:leaderId/boost", boostLeader);

/**
 * @route   GET /api/v1/leaders/:leaderId/stats
 * @desc    Get leader statistics (public)
 */
router.get("/:leaderId/stats", getLeaderStats);

/**
 * @route   GET /api/v1/leaders/:leaderId
 * @desc    Get single leader by ID (ALWAYS LAST)
 */
router.get("/:leaderId", getLeaderById);

// ================================
// PROTECTED ROUTES (AUTH REQUIRED)
// ================================

/**
 * @route   GET /api/v1/leaders/profile/me
 * @desc    Get authenticated user profile
 */
router.get("/profile/me", getMyProfile);

/**
 * @route   PUT /api/v1/leaders/profile/me
 * @desc    Update authenticated user profile
 */
router.put("/profile/me", updateMyProfile);

// ================================
// ADMIN ROUTES
// ================================

/**
 * @route   POST /api/v1/leaders/create
 * @desc    Admin/Manual Create Leader (Multiple files)
 */
router.post("/create", uploadMultiple, processAndUploadImages, createLeader);

/**
 * @route   PUT /api/v1/leaders/:leaderId
 * @desc    Update any leader (Admin) - Multiple files
 */
router.put("/:leaderId", uploadMultiple, processAndUploadImages, updateLeader);

/**
 * @route   DELETE /api/v1/leaders/:leaderId
 * @desc    Delete leader (Admin - soft delete)
 */
router.delete("/:leaderId", deleteLeader);

// ================================
// SOCIAL INTERACTIONS
// ================================

/**
 * @route   POST /api/v1/leaders/interact
 * @desc    Handle social interactions (like, follow, share)
 */
router.post("/interact", handleInteraction);

module.exports = router;
