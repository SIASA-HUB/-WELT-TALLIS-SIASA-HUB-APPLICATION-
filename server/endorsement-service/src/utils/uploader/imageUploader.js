// utils/uploader/imageUploader.js - Complete working version
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Configure multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1000 * 1024 * 1024 }, // 1000MB limit
});

// Base directories
const UPLOADS_DIR = path.join(__dirname, "../../uploads");
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

// Main upload middleware
const uploadEndorsementMedia = (req, res, next) => {
  upload.single("media")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return next();
    }

    if (!req.file) {
      console.log("No file uploaded - text only");
      return next();
    }

    const file = req.file;
    const isVideo = file.mimetype.startsWith("video/");
    const isImage = file.mimetype.startsWith("image/");

    console.log(
      `📁 Processing file: ${file.originalname}, type: ${file.mimetype}, size: ${file.size}`,
    );

    if (!isImage && !isVideo) {
      console.log("Unsupported media type");
      return next();
    }

    try {
      // Create date-based folder structure
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const dateDir = path.join(ENDORSEMENTS_DIR, String(year), month);

      if (!fs.existsSync(dateDir)) {
        fs.mkdirSync(dateDir, { recursive: true });
        console.log(`📁 Created directory: ${dateDir}`);
      }

      // Generate filename and save
      const fileName = generateFileName(file.originalname);
      const filePath = path.join(dateDir, fileName);

      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Create URL for the file
      const mediaUrl = `/uploads/endorsements/${year}/${month}/${fileName}`;

      console.log(`✅ File saved: ${mediaUrl}`);

      // Attach to request for controller to use
      req.mediaUrl = mediaUrl;
      req.fileProcessed = true;
      req.mediaType = isVideo ? "video" : "image";

      next();
    } catch (error) {
      console.error("Error saving file:", error);
      next();
    }
  });
};

module.exports = { uploadEndorsementMedia };
