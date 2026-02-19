const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const multer = require('multer');
const Logger = require('../logger/logger');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
        }
        cb(null, true);
    },
});

const uploadToCloudinary = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'leaders_profiles',
                resource_type: 'image',
                // This is the secret sauce for quality:
                transformation: [
                    { width: 1600, crop: "limit" }, // Don't upsample, but allow large size
                    { quality: "auto:good" },      // 'good' is often sharper than 'best' which can be too heavy
                    { fetch_format: "auto" }       // Cloudinary picks WebP/Avif automatically
                ]
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });

const processAndUploadImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    try {
        const uploadedImages = await Promise.all(
            req.files.map(async (file) => {
                const buffer = await sharp(file.buffer)
                    .rotate() 
                    .resize(1600, 1600, { 
                        fit: 'cover',               // Fills the frame completely
                        position: 'entropy',        // Focuses on the most interesting part (the face)
                        withoutEnlargement: true 
                    })
                    .sharpen()                      // Default sharpening is optimized for screens
                    .png({ compressionLevel: 0 })   // Send LOSSLESS data to Cloudinary
                    .toBuffer();

                const result = await uploadToCloudinary(buffer);

                return {
                    url: result.secure_url,
                    public_id: result.public_id,
                };
            })
        );

        req.body.images = uploadedImages;
        next();
    } catch (error) {
        Logger.error('Image upload failed', { error: error.message });
        res.status(500).json({ success: false, message: 'Image processing failed' });
    }
};

const deleteMediaFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        Logger.error("Delete failed", { publicId, error });
    }
};

module.exports = {
    uploadMultiple: upload.array('images', 6),
    processAndUploadImages,
    deleteMediaFromCloudinary
};