// videoRoutes.js
const express = require('express');
const router = express.Router();

const {
  createHashTagToPost,
  recordVideoLike,
  getPostHashtagsByPostId,
  recordVideoView,
  getVideoStats
} = require('../controller/hashTags');

const { body, param } = require('express-validator');

// --- Validation rules ---
const validateCreateHashtag = [
  body('video_id').notEmpty().withMessage('video_id is required'),
  body('hashtag').notEmpty().withMessage('hashtag is required'),
  body('created_at')
    .optional()
    .isISO8601()
    .withMessage('created_at must be a valid datetime')
];

const validateGetHashtags = [
  param('videoId').notEmpty().withMessage('videoId is required')
];

const validateRecordView = [
  body('videoId').notEmpty().withMessage('videoId is required')
];

const validateRecordLike = [
  body('videoId').notEmpty().withMessage('videoId is required'),
  body('userId').optional()
];

// --- Hashtag routes ---
router.post('/create', validateCreateHashtag, createHashTagToPost);
router.get('/video/status/:videoId', getVideoStats);
router.get('/posts/:postId/hashtags', getPostHashtagsByPostId);

// --- Video view route ---
router.post('/videos/view', validateRecordView, recordVideoView);

// --- Video like route ---
router.post('/videos/like', validateRecordLike, recordVideoLike);

// --- Export router ---
module.exports = router;
