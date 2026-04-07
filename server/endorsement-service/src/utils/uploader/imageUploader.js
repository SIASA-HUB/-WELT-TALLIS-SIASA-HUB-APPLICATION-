// config/multer.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const uploadPath = path.join(
      __dirname,
      "../../uploads/endorsements",
      String(year),
      month,
    );
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname);
    cb(null, `endorsement-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// Enhanced image optimization with better compression
const optimizeForStory = async (
  inputPath,
  outputPath,
  width,
  height,
  quality = 75,
) => {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: "cover",
        position: "center",
        withoutEnlargement: true,
      })
      .jpeg({
        quality,
        progressive: true,
        mozjpeg: true,
        optimizeCoding: true,
      })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error("Image optimization failed:", error);
    return false;
  }
};

// Process and compress image regardless of original size
const compressAndOptimize = async (inputPath, outputPath, options = {}) => {
  const { width = 800, height = 800, quality = 80 } = options;

  try {
    const metadata = await sharp(inputPath).metadata();
    let pipeline = sharp(inputPath);

    // Resize if image is larger than target dimensions
    if (metadata.width > width || metadata.height > height) {
      pipeline = pipeline.resize(width, height, {
        fit: "cover",
        position: "center",
        withoutEnlargement: true,
      });
    }

    await pipeline
      .jpeg({
        quality,
        progressive: true,
        mozjpeg: true,
        optimizeCoding: true,
        chromaSubsampling: "4:2:0",
      })
      .toFile(outputPath);

    return true;
  } catch (error) {
    console.error("Image compression failed:", error);
    return false;
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 10MB max (will compress anyway)
    files: 1,
  },
  fileFilter: fileFilter,
});

// Enhanced middleware that compresses even large files
const processEndorsementImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const dir = path.dirname(filePath);
    const filename = path.basename(filePath, path.extname(filePath));
    const ext = ".jpg";

    // Get file size before processing
    const originalStats = fs.statSync(filePath);
    console.log(
      `Original file size: ${(originalStats.size / 1024 / 1024).toFixed(2)} MB`,
    );

    // Get the year and month from the path
    const pathParts = dir.split(path.sep);
    const year = pathParts[pathParts.length - 2];
    const month = pathParts[pathParts.length - 1];

    // Compress the original file first (reduce size before multiple conversions)
    const tempCompressedPath = path.join(dir, `${filename}-temp${ext}`);
    await compressAndOptimize(filePath, tempCompressedPath, {
      width: 800,
      height: 800,
      quality: 75,
    });

    // Use the compressed version for further processing
    const sourcePath = tempCompressedPath;

    // Create different sizes for stories
    const storyThumbPath = path.join(dir, `${filename}-story${ext}`);
    const storyCardPath = path.join(dir, `${filename}-card${ext}`);
    const mediumPath = path.join(dir, `${filename}-medium${ext}`);

    // Process all sizes with appropriate quality
    await Promise.all([
      optimizeForStory(sourcePath, storyThumbPath, 100, 100, 70),
      optimizeForStory(sourcePath, storyCardPath, 150, 150, 75),
      optimizeForStory(sourcePath, mediumPath, 300, 300, 80),
    ]);

    // Delete temporary compressed file
    fs.unlinkSync(tempCompressedPath);

    // Delete original file
    fs.unlinkSync(filePath);

    // Get final sizes
    const finalStats = {
      story: fs.statSync(storyThumbPath).size,
      card: fs.statSync(storyCardPath).size,
      medium: fs.statSync(mediumPath).size,
    };

    console.log("Final image sizes (bytes):", finalStats);
    console.log(
      `Total size saved: ${(originalStats.size - (finalStats.story + finalStats.card + finalStats.medium)) / 1024 / 1024} MB`,
    );

    // Store URLs for database
    req.imageUrls = {
      story: `/uploads/endorsements/${year}/${month}/${filename}-story${ext}`,
      card: `/uploads/endorsements/${year}/${month}/${filename}-card${ext}`,
      medium: `/uploads/endorsements/${year}/${month}/${filename}-medium${ext}`,
    };

    next();
  } catch (error) {
    console.error("Error processing endorsement image:", error);
    // If image processing fails, try to at least keep the original
    if (req.file && req.file.path) {
      console.log("Keeping original file due to processing error");
    }
    req.imageUrls = null;
    next();
  }
};

// Middleware for streaming images with caching headers
const streamEndorsementImage = (req, res, next) => {
  const { imagePath } = req.params;
  const fullPath = path.join(
    __dirname,
    "../../uploads/endorsements",
    imagePath,
  );

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: "Image not found" });
  }

  res.setHeader(
    "Cache-Control",
    "public, max-age=3600, stale-while-revalidate=86400",
  );
  res.setHeader("Content-Type", "image/jpeg");

  const readStream = fs.createReadStream(fullPath);
  readStream.pipe(res);

  readStream.on("error", (error) => {
    console.error("Error streaming image:", error);
    res.status(500).end();
  });
};

// Cleanup old/unused images
const cleanupOrphanedImages = async () => {
  try {
    const { safeQuery } = require("../configurations/db");

    const endorsements = await safeQuery(
      `SELECT image_url FROM endorsements WHERE image_url IS NOT NULL`,
    );

    const usedImages = new Set();
    endorsements.forEach((e) => {
      if (e.image_url) usedImages.add(path.basename(e.image_url));
    });

    const uploadsDir = path.join(__dirname, "../../uploads/endorsements");
    const deleteOrphaned = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          deleteOrphaned(filePath);
          if (fs.readdirSync(filePath).length === 0) {
            fs.rmdirSync(filePath);
          }
        } else {
          if (!usedImages.has(file) && file !== ".gitkeep") {
            fs.unlinkSync(filePath);
            console.log(`Deleted orphaned image: ${filePath}`);
          }
        }
      });
    };

    if (fs.existsSync(uploadsDir)) {
      deleteOrphaned(uploadsDir);
    }
  } catch (error) {
    console.error("Error cleaning up images:", error);
  }
};

// Get image stats for monitoring
const getImageStats = async () => {
  const uploadsDir = path.join(__dirname, "../../uploads/endorsements");
  let totalSize = 0;
  let totalFiles = 0;

  const calculateStats = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        calculateStats(filePath);
      } else {
        totalSize += stat.size;
        totalFiles++;
      }
    });
  };

  if (fs.existsSync(uploadsDir)) {
    calculateStats(uploadsDir);
  }

  return {
    totalFiles,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    averageSizeKB:
      totalFiles > 0 ? (totalSize / totalFiles / 1024).toFixed(2) : 0,
  };
};

module.exports = {
  uploadEndorsementImage: [upload.single("image"), processEndorsementImage],
  upload,
  streamEndorsementImage,
  cleanupOrphanedImages,
  getImageStats,
  processEndorsementImage,
};
