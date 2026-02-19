const dotenv = require('dotenv');
dotenv.config();
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const multer = require('multer');
const Logger = require('../logger/logger');

// ================= CLOUDINARY CONFIGURATION =================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================= MULTER MEMORY STORAGE =================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
    }
    cb(null, true);
  },
});

// ================= CLOUDINARY UPLOAD HELPER (EAGER PROCESSING) =================
const uploadToCloudinary = (buffer, folder = 'posts') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // EAGER PROCESSING: This creates the optimized file immediately during upload
        eager: [
          { 
            width: 1280, 
            height: 1280, 
            crop: "limit", 
            fetch_format: "auto", 
            quality: "auto" 
          }
        ],
        eager_async: false, // Ensures it's finished before we return the URL
      },
      (error, result) => {
        if (error) return reject(error);
        
        // We use the Eager URL if it exists, as it points to the fully optimized version
        const finalUrl = result.eager && result.eager.length > 0 
          ? result.eager[0].secure_url 
          : result.secure_url;
          
        resolve({
          url: finalUrl,
          public_id: result.public_id
        });
      }
    );
    stream.end(buffer);
  });

// ================= PROCESS SINGLE IMAGE =================
const processSingleImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // 1. Sharp prepares the image (Fix rotation, Resize, Sharpen)
    const buffer = await sharp(req.file.buffer)
      .rotate()
      .resize(1280, 1280, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .sharpen({ sigma: 1, m1: 0.5, m2: 0.5 })
      .webp({ quality: 85, smartSubsample: true })
      .toBuffer();

    // 2. Upload to Cloudinary with Eager instructions
    const result = await uploadToCloudinary(buffer);

    req.body.image = {
      url: result.url,
      public_id: result.public_id,
    };

    next();
  } catch (error) {
    Logger.error('Single image upload failed', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
};

// ================= PROCESS MULTIPLE IMAGES =================
const processMultipleImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        const buffer = await sharp(file.buffer)
          .rotate()
          .resize(1280, 1280, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .sharpen()
          .webp({ quality: 85, smartSubsample: true })
          .toBuffer();

        const result = await uploadToCloudinary(buffer);

        return {
          url: result.url,
          public_id: result.public_id,
        };
      })
    );

    req.body.images = uploadedImages;
    next();
  } catch (error) {
    Logger.error('Multiple image upload failed', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
};

// ================= DELETE MEDIA =================
const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    Logger.error('Failed to delete asset from Cloudinary', error);
    throw new Error('Failed to delete asset from Cloudinary');
  }
};

module.exports = {
  uploadSingle: upload.single('image'),
  processSingleImage,
  uploadMultiple: upload.array('images', 6),
  processMultipleImages,
  deleteMediaFromCloudinary,
};