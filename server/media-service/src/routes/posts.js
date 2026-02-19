// routes/posts.js
const express = require('express');
const router = express.Router();

const {
  uploadSingle,            // For single image
  uploadMultiple,          // For multiple images
  processSingleImage,
  processMultipleImages,
} = require('../utils/uploader/imageProcessing');

const {
createPost, getPersonalizedFeed, getAllPosts 
} = require('../controllers/posts');

// ================= CREATE POST =================
// Example: single image
// router.post('/create', uploadSingle, processSingleImage, createPost);

// Example: multiple images (max 6)
// Use this if you allow multiple images per post
router.post('/create', uploadMultiple, processMultipleImages, createPost);

// ================= GET POSTS =================
router.get('/feed', getPersonalizedFeed);

router.get('/get', getAllPosts);

module.exports = router;
