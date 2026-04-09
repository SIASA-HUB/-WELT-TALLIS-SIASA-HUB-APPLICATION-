const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const multer = require("multer");
const Logger = require("../logger/logger");

// Setup upload directory
const UPLOAD_DIR = path.join(__dirname, "../../../../public/uploads/leaders");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Map logical URLs
const BASE_URL_PATH = "/uploads/leaders";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid image format"), false);
    }
    cb(null, true);
  },
});

// Single file upload (for aspirant registration)
const uploadSingle = upload.single("image");

// Multiple files upload (for admin create)
const uploadMultiple = upload.array("images", 5);

/**
 * Upload to Local Disk using Sharp
 */
const uploadToLocalDisk = async (buffer, publicId = null) => {
  const finalPublicId =
    publicId ||
    `leader_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Generate versions
    const originalFileName = `${finalPublicId}_original.webp`;
    const mediumFileName = `${finalPublicId}_medium.webp`;
    const thumbFileName = `${finalPublicId}_thumb.webp`;

    // Process and save Full/Original (Max 1200x1200)
    await image
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(UPLOAD_DIR, originalFileName));

    // Process and save Medium (800x800)
    await sharp(buffer)
      .resize(800, 800, { fit: "cover", gravity: "face" })
      .webp({ quality: 80 })
      .toFile(path.join(UPLOAD_DIR, mediumFileName));

    // Process and save Thumb (400x400)
    await sharp(buffer)
      .resize(400, 400, { fit: "cover", gravity: "face" })
      .webp({ quality: 80 })
      .toFile(path.join(UPLOAD_DIR, thumbFileName));

    // Wait slightly to ensure disk writes complete
    const response = {
      url: `${BASE_URL_PATH}/${originalFileName}`,
      public_id: finalPublicId,
      format: "webp",
      width: metadata.width,
      height: metadata.height,
      bytes: metadata.size,
      versions: {
        original: `${BASE_URL_PATH}/${originalFileName}`,
        medium: `${BASE_URL_PATH}/${mediumFileName}`,
        thumbnail: `${BASE_URL_PATH}/${thumbFileName}`,
      },
    };
    return response;
  } catch (err) {
    Logger.error("Error writing image to local disk:", err);
    throw err;
  }
};

/**
 * Process and upload images (supports both single and multiple files)
 */
const processAndUploadImages = async (req, res, next) => {
  try {
    const processingPromise = (async () => {
      if (req.file) {
        Logger.info(`Processing single image locally: ${req.file.originalname}`);
        const result = await uploadToLocalDisk(req.file.buffer);

        req.processedImages = [
          {
            ...result,
            index: 0,
            original_filename: req.file.originalname,
            is_primary: true,
          },
        ];
        req.body.primary_image_url = result.url;
      } else if (req.files && req.files.length > 0) {
        Logger.info(`Processing ${req.files.length} images locally`);
        const results = await Promise.all(
          req.files.map(file => uploadToLocalDisk(file.buffer))
        );

        req.processedImages = results.map((result, index) => ({
          ...result,
          index,
          original_filename: req.files[index].originalname,
          is_primary: index === 0,
        }));

        req.body.images = req.processedImages;
        req.body.primary_image_url = req.processedImages[0]?.url;
      }
      next();
    })();

    await processingPromise;
  } catch (error) {
    Logger.error("Image processing error:", error);
    res.status(500).json({
      success: false,
      message: "Image processing failed. Please check file format.",
    });
  }
};

// Deprecated mock functions for compatibility
const deleteMediaFromCloudinary = async (publicId) => {
    // Delete from disk if necessary
    return true; 
};

const bulkDeleteFromCloudinary = async (publicIds) => {
    return true;
};

const optimizeExistingImage = async (publicId) => {
  return {
    url: `${BASE_URL_PATH}/${publicId}_original.webp`,
    thumbnail: `${BASE_URL_PATH}/${publicId}_thumb.webp`,
    medium: `${BASE_URL_PATH}/${publicId}_medium.webp`,
  };
};

const getImageInfo = async (publicId) => {
  return {};
};

module.exports = {
  uploadMultiple,
  uploadSingle,
  processAndUploadImages,
  uploadToLocalDisk,
  deleteMediaFromCloudinary,
  bulkDeleteFromCloudinary,
  optimizeExistingImage,
  getImageInfo,
};
