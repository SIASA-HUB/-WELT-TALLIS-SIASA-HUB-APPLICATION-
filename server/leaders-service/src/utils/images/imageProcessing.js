const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const multer = require('multer');
const Logger  = require('../logger/logger');

// cloudinary  configurtions 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//multer  memory  storage 
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, 
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
        }
        cb(null, true);
    },
});

//uploader  helper 
const uploadToCloudinary = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'leaders_profiles',
                format: 'webp',
                resource_type: 'image',
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });

//middle ware
const processAndUploadImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    try {
        const uploadedImages = await Promise.all(
            req.files.map(async (file) => {
                const buffer = await sharp(file.buffer)
                    .resize(800, 800, {
                        fit: 'cover',
                        position: sharp.strategy.entropy,
                        withoutEnlargement: true,
                    })
                    .webp({ quality: 90 })
                    .toBuffer();

                const result = await uploadToCloudinary(buffer);

                return {
                    url: result.secure_url,
                    public_id: result.public_id,
                };
            })
        );

        // Attach to body for controller
        req.body.images = uploadedImages;

        next();
    } catch (error) {
        Logger.error('Multiple image upload failed', {
            message: error.message,
            stack: error.stack,
        });

        res.status(500).json({
            message: 'Image upload failed',
        });
    }
};



const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
    throw new Error("failed to delete assest from cloudinary");
  }
};


//exports
module.exports = {
    uploadMultiple: upload.array('images', 6), // max 6 images
    processAndUploadImages,
};
