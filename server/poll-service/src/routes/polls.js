const express = require("express");
const router = express.Router();
const {
  uploadSingle,
  processSingleImage,
} = require("../utils/uploader/imageProcessing");
const {
  createPoll,
  getAllPolls,
  getPollById,
  voteOnPoll,
  sharePoll,
  getPollResults,
  deletePoll,
} = require("../controllers/pollsController");

// ===== PUBLIC ROUTES =====
// Get all polls with pagination
router.get("/", getAllPolls);

// Get poll by ID
router.get("/:pollId", getPollById);

// Get poll results
router.get("/:pollId/results", getPollResults);

// ===== INTERACTION ROUTES =====
// Vote on poll
router.post("/:pollId/vote", voteOnPoll);

// Share poll
router.post("/:pollId/share", sharePoll);

// ===== PROTECTED ROUTES (add auth middleware as needed) =====
// Create new poll with image upload to Cloudinary
router.post(
  "/create",
  uploadSingle, // Multer handles file upload
  processSingleImage, // Sharp processes and uploads to Cloudinary
  createPoll, // Controller creates poll with image URL
);

// Delete poll
router.delete("/:pollId", deletePoll);

module.exports = router;
