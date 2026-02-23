const express = require("express");
const router = express.Router();

const {
  uploadMultiple,
  processAndUploadImages,
} = require("../utils/images/imageProcessing");

const {
  createLeader,
  getAllLeaders,
  getLeaderById,
  searchLeaders,
  getLeadersByParty,
  getLeadersByCounty,
  updateLeader,
  deleteLeader,

  getFeaturedLeaders,
} = require("../controllers/leaderController");

const {
  createManifesto,
  editManifesto,
  getManifestoByLeaderId,
  voteOnManifesto,
  getManifestoStats,
  createManifestoComment,
  getManifestoComments,
} = require("../controllers/manifesto");

const {
  handleInteraction,
  postComment,
} = require("../controllers/leaderInteractionController");
// ================================
// LEADERS PUBLIC ROUTES
// ================================

// SEARCH LEADERS (should be before /:leaderId to avoid conflict)
router.get("/leaders/search", searchLeaders);

// GET FEATURED LEADERS
router.get("/leaders/featured", getFeaturedLeaders);

// GET LEADERS BY PARTY
router.get("/leaders/party/:party", getLeadersByParty);

// GET LEADERS BY COUNTY
router.get("/leaders/county/:county", getLeadersByCounty);

// GET ALL LEADERS (with pagination)
router.get("/leaders", getAllLeaders);

// GET SINGLE LEADER
router.get("/leaders/:leaderId", getLeaderById);

// ================================
// LEADERS PROTECTED ROUTES (Add auth middleware)
// ================================

// CREATE LEADER
router.post(
  "/leaders/create",
  uploadMultiple,
  processAndUploadImages,
  createLeader,
);

// UPDATE LEADER
router.put(
  "/leaders/:leaderId",
  uploadMultiple,
  processAndUploadImages,
  updateLeader,
);

router.post("/leaders/interact", handleInteraction);
router.post("/leaders/comment", postComment);

// ================================
// MANIFESTOS
// ================================

// CREATE MANIFESTO
router.post("/manifestos/create", createManifesto);

// EDIT MANIFESTO
router.put("/manifestos/:manifestoId", editManifesto);

// GET MANIFESTO BY LEADER ID
router.get("/manifestos/leader/:leaderId", getManifestoByLeaderId);

// VOTE ON MANIFESTO
router.post("/manifestos/:manifestoId/vote", voteOnManifesto);

// GET MANIFESTO STATS
router.get("/manifestos/:manifestoId/stats", getManifestoStats);

// CREATE MANIFESTO COMMENT (fixed typo)
router.post("/manifestos/:manifestoId/comments", createManifestoComment);

// GET MANIFESTO COMMENTS (fixed typo)
router.get("/manifestos/:manifestoId/comments", getManifestoComments);

// ================================
// ADDITIONAL USEFUL ROUTES
// ================================

// BULK CREATE LEADERS (for admin/import)
// router.post("/leaders/bulk", uploadMultiple, bulkCreateLeaders);

// GET LEADER INTERACTION STATS (if different from main stats)
// router.get("/leaders/:leaderId/interaction-stats", getLeaderInteractionStats);

module.exports = router;
