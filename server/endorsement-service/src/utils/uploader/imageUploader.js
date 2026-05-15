// utils/uploader/imageUploader.js - Complete working version
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Base directories
// FIX: ../../../ goes from src/utils/uploader -> src/utils -> src -> endorsement-service root
// This matches Docker volume: ./endorsement-service/uploads -> /usr/src/app/endorsement-service/uploads
const UPLOADS_DIR = path.join(__dirname, "../../../uploads");
const ENDORSEMENTS_DIR = path.join(UPLOADS_DIR, "endorsements");

// Ensure directories exist
const ensureDirectories = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(ENDORSEMENTS_DIR)) {
    fs.mkdirSync(ENDORSEMENTS_DIR, { recursive: true });
  }
};
ensureDirectories();

// Generate unique filename
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString("hex");
  const ext = path.extname(originalName);
  return `${timestamp}_${random}${ext}`;
};

// Configure multer with disk storage for large file support (videos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const dateDir = path.join(ENDORSEMENTS_DIR, String(year), month);
    
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
    }
    cb(null, dateDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFileName(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1000 * 1024 * 1024 }, // 1000MB limit
});

// Main upload middleware
const uploadEndorsementMedia = (req, res, next) => {
  upload.single("media")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ success: false, message: "File upload error", error: err.message });
    }

    if (!req.file) {
      console.log("No file uploaded - text only");
      return next();
    }

    const file = req.file;
    const isVideo = file.mimetype.startsWith("video/");
    const isImage = file.mimetype.startsWith("image/");

    console.log(
      `📸 Processing file on disk: ${file.filename}, type: ${file.mimetype}, size: ${file.size}`,
    );

    if (!isImage && !isVideo) {
      console.log("Unsupported media type");
      // Cleanup file if unsupported
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return next();
    }

    try {
      // Create URL for the file based on its saved path
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      
      const mediaUrl = `/uploads/endorsements/${year}/${month}/${file.filename}`;

      console.log(`✅ File saved on disk: ${mediaUrl}`);

      // Attach to request for controller to use
      req.mediaUrl = mediaUrl;
      req.fileProcessed = true;
      req.mediaType = isVideo ? "video" : "image";

      next();
    } catch (error) {
      console.error("Error processing disk file:", error);
      next();
    }
  });
};

module.exports = { uploadEndorsementMedia };
