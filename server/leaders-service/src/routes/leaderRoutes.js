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
  getAllLeaders,
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
  deleteLeader,
  getLeaderStats,
  getPopularLeaders,
  boostLeader,
  getFeaturedLeaders,
} = require("../controllers/leaderController");

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

router.post("/manifestos/create", createManifesto);
router.put("/manifestos/:manifestoId", editManifesto);
router.get("/manifestos/leader/:leaderId", getManifestoByLeaderId);
router.post("/manifestos/:manifestoId/vote", voteOnManifesto);
router.get("/manifestos/:manifestoId/stats", getManifestoStats);
router.delete("/manifestos/:manifestoId", deleteManifesto);
router.get("/manifestos/trending", getTrendingManifestos); // ← MOVED THIS UP

// ================================
// LEADERS PUBLIC ROUTES (SPECIFIC PATHS BEFORE PARAMETERS)
// ================================

// Search and Discovery (specific paths first)
router.get("/search", searchLeaders);
router.get("/featured", getFeaturedLeaders);
router.get("/popular", getPopularLeaders);

// Filtered Lists (specific paths)
router.get("/party/:party", getLeadersByParty);
router.get("/county/:county", getLeadersByCounty);
router.get("/constituency/:constituency", getLeadersByConstituency);
router.get("/ward/:ward", getLeadersByWard);

// Directory - Get all leaders
router.get("/", getAllLeaders);

// ================================
// ROUTES WITH PARAMETERS (PUT THESE LAST)
// ================================

// Boost a leader (deduct from wallet)
router.post("/:leaderId/boost", boostLeader);

// Get leader stats (public)
router.get("/:leaderId/stats", getLeaderStats);

// Get single leader by ID (ALWAYS LAST)
router.get("/:leaderId", getLeaderById);

// ================================
// PROTECTED ROUTES (AUTH REQUIRED)
// ================================

// Get authenticated user profile
router.get("/profile/me", getMyProfile);

// Update authenticated user profile
router.put("/profile/me", updateMyProfile);

// ================================
// ADMIN ROUTES
// ================================

// Admin/Manual Create Leader (Multiple files)
router.post("/create", uploadMultiple, processAndUploadImages, createLeader);

// Update any leader (Admin) - Multiple files
router.put("/:leaderId", uploadMultiple, processAndUploadImages, updateLeader);

// Delete leader (Admin)
router.delete("/:leaderId", deleteLeader);

// ================================
// SOCIAL INTERACTIONS
// ================================

router.post("/interact", handleInteraction);

module.exports = router;
