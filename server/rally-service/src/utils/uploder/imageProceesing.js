const dotenv = require("dotenv");
dotenv.config();
const sharp = require("sharp");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Logger = require("../logger/logger");

// ================= UPLOADS DIRECTORY =================
const UPLOADS_DIR = path.join(__dirname, "../../../uploads");
const RALLIES_DIR = path.join(UPLOADS_DIR, "rallies");

// Ensure directories exist
const ensureDirectories = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(RALLIES_DIR)) {
    fs.mkdirSync(RALLIES_DIR, { recursive: true });
  }
};
ensureDirectories();

// ================= MULTER MEMORY STORAGE =================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
    }
    cb(null, true);
  },
});

// ================= GENERATE UNIQUE FILENAME =================
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  const ext = ".webp"; // Always save as webp after Sharp processing
  return `${timestamp}_${random}${ext}`;
};

// ================= PROCESS SINGLE IMAGE =================
const processSingleImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // 1. Sharp prepares the image (Fix rotation, Resize, Sharpen)
    const buffer = await sharp(req.file.buffer)
      .rotate()
      .resize(1280, 1280, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .sharpen({ sigma: 1, m1: 0.5, m2: 0.5 })
      .webp({ quality: 85, smartSubsample: true })
      .toBuffer();

    // 2. Save to disk with date-based folder structure
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const dateDir = path.join(RALLIES_DIR, String(year), month);

    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
      Logger.info(`📁 Created directory: ${dateDir}`);
    }

    const fileName = generateFileName(req.file.originalname);
    const filePath = path.join(dateDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // 3. Create URL path for the file
    const imageUrl = `/uploads/rallies/${year}/${month}/${fileName}`;
    Logger.info(`✅ Rally image saved to disk: ${imageUrl}`);

    req.body.image = {
      url: imageUrl,
      public_id: null,
    };

    next();
  } catch (error) {
    Logger.error("Single image process failed", error);
    res.status(500).json({ message: "Image upload processing failed" });
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
            fit: "inside",
            withoutEnlargement: true,
          })
          .sharpen()
          .webp({ quality: 85, smartSubsample: true })
          .toBuffer();

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const dateDir = path.join(RALLIES_DIR, String(year), month);

        if (!fs.existsSync(dateDir)) {
          fs.mkdirSync(dateDir, { recursive: true });
        }

        const fileName = generateFileName(file.originalname);
        const filePath = path.join(dateDir, fileName);
        fs.writeFileSync(filePath, buffer);

        const imageUrl = `/uploads/rallies/${year}/${month}/${fileName}`;

        return {
          url: imageUrl,
          public_id: null,
        };
      }),
    );

    req.body.images = uploadedImages;
    next();
  } catch (error) {
    Logger.error("Multiple image process failed", error);
    res.status(500).json({ message: "Image upload processing failed" });
  }
};

// ================= DELETE MEDIA =================
const deleteMediaFromCloudinary = async (publicId) => {
  // No-op: Cloudinary removed. Images are stored on local disk.
  // Old images with publicId are simply abandoned. New images use disk paths.
  return Promise.resolve();
};

module.exports = {
  uploadSingle: upload.single("image"),
  processSingleImage,
  uploadMultiple: upload.array("images", 6),
  processMultipleImages,
  deleteMediaFromCloudinary,
};
