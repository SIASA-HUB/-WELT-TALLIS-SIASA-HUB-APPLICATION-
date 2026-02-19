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

//cloudinary  uploader

const uploadVideoToCloudinary = async (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video',
                folder: 'backup_videos',
                eager: [
                    { width: 720, height: 1280, crop: 'limit', format: 'mp4', video_codec: 'h264', quality: 'auto' },
                    { width: 600, height: 400, crop: 'fill', gravity: 'auto', format: 'jpg', quality: 'auto' }
                ],
                eager_async: false 
            },
            (error, result) => {
                if (error) {
                    Logger.error(`Cloudinary Stream Error: ${error.message}`);
                    return reject(error);
                }
                resolve(result);
            }
        );
        
        // Use setImmediate to ensure the stream starts correctly in the event loop
        setImmediate(() => {
            stream.end(buffer);
        });
    });
};

//upload  controller
const handleUploadBackupVideo = asyncHandler(async (req, res) => {
    const postId = req.params.postId || req.body.postId;
    const file = req.file;

    if (!postId || !file) {
        return res.status(400).json({ success: false, message: 'Missing postId or file' });
    }

    try {
        // 1. LIMIT CHECK
        const existing = await safeQueryOne('SELECT COUNT(*) AS count FROM backup_videos WHERE post_id = ?', [postId]);
        const count = existing?.count || 0;
        
        if (count >= 20) {
            return res.status(400).json({ success: false, message: 'Limit reached (20 videos max)' });
        }

        // 2. CLOUDINARY UPLOAD
        Logger.info(`[Step 1] Cloudinary Uploading for Post: ${postId}`);
        const uploadResult = await uploadVideoToCloudinary(file.buffer);
        
        // Safely extract URLs from eager transformations
        const videoUrl = uploadResult.eager?.[0]?.secure_url || uploadResult.secure_url;
        const thumbUrl = uploadResult.eager?.[1]?.secure_url || uploadResult.thumbnail_url;

        // 3. DATABASE INSERT
        Logger.info(`[Step 2] MariaDB Inserting...`);
        const sql = `
            INSERT INTO backup_videos (post_id, public_id, video_url, thumbnail_url, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        `;
        
        const dbResult = await safeQuery(sql, [postId, uploadResult.public_id, videoUrl, thumbUrl]);
        Logger.info(`[Step 2] MariaDB Success.`);

        // 4. CACHE INVALIDATION
        const listCacheKey = `post_backup_list_${postId}`;
        try {
            // Check if client is nested under .client or direct
            const rClient = RedisClient.client || RedisClient;
            if (rClient && typeof rClient.del === 'function') {
                await rClient.del(listCacheKey);
                Logger.info(`[Step 3] Cache Invalidated: ${listCacheKey}`);
            }
        } catch (redisErr) {
            Logger.warn(`Cache invalidation failed but upload succeeded: ${redisErr.message}`);
        }

        // 5. FINAL RESPONSE
        return res.status(200).json({
            success: true,
            message: "Backup saved successfully",
            videoUrl,
            thumbnail: thumbUrl,
            postId
        });

    } catch (error) {
        Logger.error(`[UPLOAD CRITICAL ERROR]: ${error.stack || error.message}`);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal processing error', 
            details: error.message 
        });
    }
});









const getBackedupVideosByPostId = asyncHandler(async (req, res) => {
    const postId = req.params.postId?.trim();

    Logger.info('[Fetch] Incoming request', { postId });

    if (!postId) {
        Logger.warn('[Fetch] Missing postId');
        return res.status(400).json({ success: false, message: 'Post ID required' });
    }

    const cacheKey = `post_backup_list_${postId}`;
    const rClient = RedisClient.client || RedisClient;

    try {
        // ================= REDIS =================
        if (rClient && typeof rClient.get === 'function') {
            Logger.info('[Fetch] Checking Redis', { cacheKey });

            const cached = await rClient.get(cacheKey);

            Logger.info('[Fetch] Redis response', {
                exists: !!cached,
                length: cached?.length || 0
            });

            if (cached && cached !== '[]') {
                const parsed = JSON.parse(cached);

                Logger.info('[Fetch] Redis HIT', { count: parsed.length });

                return res.json({
                    success: true,
                    source: 'cache',
                    count: parsed.length,
                    videos: parsed
                });
            }
        } else {
            Logger.warn('[Fetch] Redis client unavailable');
        }

        // ================= DATABASE =================
        Logger.info('[Fetch] Querying MariaDB', { postId });

        const result = await safeQuery(
            `SELECT 
                id AS video_id,
                public_id,
                video_url,
                thumbnail_url,
                created_at
             FROM backup_videos
             WHERE post_id = ?
             ORDER BY created_at DESC`,
            [postId]
        );

        Logger.info('[Fetch] Raw DB result type', {
            isArray: Array.isArray(result),
            keys: Object.keys(result || {})
        });

        const videos = Array.isArray(result)
            ? (Array.isArray(result[0]) ? result[0] : result)
            : [];

        Logger.info('[Fetch] DB Success', { count: videos.length });

        // ================= CACHE WRITE =================
        if (rClient && typeof rClient.set === 'function') {
            await rClient.setex(cacheKey, 60, JSON.stringify(videos));

            Logger.info('[Fetch] Cache refreshed', { cacheKey });
        }

        return res.json({
            success: true,
            source: 'database',
            count: videos.length,
            videos
        });

    } catch (error) {
        Logger.error('[Fetch CRASH]', {
            message: error.message,
            stack: error.stack,
            postId,
            cacheKey
        });

        return res.status(500).json({
            success: false,
            message: 'Fetch failed',
            error: error.message // TEMP: remove in prod
        });
    }
});




module.exports = { handleUploadBackupVideo, getBackedupVideosByPostId };