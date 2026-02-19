// routes/backupRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Logger = require('../utils/logger/logger');
const { handleUploadBackupVideo, getBackedupVideosByPostId } = require('../controllers/backup');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files allowed'), false);
        }
    }
});

const uploadMiddleware = (req, res, next) => {
    Logger.info(`[Router] Received upload request for PostID: ${req.params.postId}`);
    
    upload.single('video')(req, res, (err) => {
        if (err) {
            Logger.error(`[Router] Multer Error: ${err.message}`);
            return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
            Logger.warn(`[Router] Upload attempted but no file found in 'video' field`);
        } else {
            Logger.info(`[Router] File received: ${req.file.originalname} (${req.file.size} bytes)`);
        }
        next();
    });
};

router.post('/:postId', uploadMiddleware, handleUploadBackupVideo);
router.get('/:postId', getBackedupVideosByPostId);

module.exports = router;