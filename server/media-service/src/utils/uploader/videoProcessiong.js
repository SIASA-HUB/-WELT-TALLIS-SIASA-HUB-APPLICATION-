const Logger = require('../utils/logger/logger');
const RedisClient = require('../utils/redis/redis');
const asyncHandler = require('express-async-handler');
const { safeQuery, safeQueryOne } = require('../configurations/db');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================= BACKGROUND WORKER ================= */
const processVideoInBackground = async (postId, fileBuffer) => {
    try {
        Logger.info(`[Background] Starting Cloudinary upload for Post ${postId}`);
        
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video',
                    folder: 'backup_videos',
                    quality: 'auto'
                },
                (error, result) => (error ? reject(error) : resolve(result))
            );
            stream.end(fileBuffer);
        });

        const videoUrl = uploadResult.secure_url;

        /**
         * FIX: Generate a transformed thumbnail URL.
         * c_fill: Crops to fill the dimensions without stretching.
         * w_500,h_300: Adjust these numbers to match your card's CSS size.
         * so_0: Takes the frame from the very start (second 0).
         */
        const thumbUrl = cloudinary.url(uploadResult.public_id, {
            resource_type: 'video',
            format: 'jpg',
            transformation: [
                { width: 500, height: 300, crop: 'fill', gravity: 'center' },
                { start_offset: "0" }
            ]
        });

        // Save to Database
        const sql = `
            INSERT INTO backup_videos (post_id, public_id, video_url, thumbnail_url, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        `;
        await safeQuery(sql, [postId, uploadResult.public_id, videoUrl, thumbUrl]);

        // Clear Cache
        const rClient = RedisClient.client || RedisClient;
        if (rClient && typeof rClient.del === 'function') {
            await rClient.del(`post_backup_list_${postId}`);
        }

        Logger.info(`[Background] Successfully processed video for Post ${postId}`);
    } catch (error) {
        Logger.error(`[Background Error] Failed for Post ${postId}: ${error.message}`);
    }
};

/* ================= UPLOAD CONTROLLER ================= */
const handleUploadBackupVideo = asyncHandler(async (req, res) => {
    const postId = req.params.postId || req.body.postId;
    const file = req.file;

    if (!postId || !file) {
        return res.status(400).json({ success: false, message: 'Missing postId or file' });
    }

    const existing = await safeQueryOne('SELECT COUNT(*) AS count FROM backup_videos WHERE post_id = ?', [postId]);
    if ((existing?.count || 0) >= 20) {
        return res.status(400).json({ success: false, message: 'Limit reached (20 videos max)' });
    }

    processVideoInBackground(postId, file.buffer);

    return res.status(202).json({
        success: true,
        message: "Video is being processed in the background",
        postId: postId
    });
});

module.exports = { handleUploadBackupVideo };