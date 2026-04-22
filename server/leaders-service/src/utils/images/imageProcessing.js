// utils/images/localImageProcessing.js - HIGH QUALITY VERSION (Logic only changed)

const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Get the upload directory path (inside leaders-service)
const getUploadDir = () => {
  // This will point to: /c/ballot/server/leaders-service/uploads/leaders
  return path.join(__dirname, "../../../uploads/leaders");
};

// Ensure upload directories exist (creates if not exists)
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
    console.log(`📁 Directory exists: ${dirPath}`);
  } catch {
    console.log(`📁 Creating directory: ${dirPath}`);
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Process and save images to local disk with Sharp
const processAndSaveImages = async (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (files.length === 0) {
    return next();
  }

  try {
    const leaderId = req.body.leader_id || req.params.leaderId || `temp_${Date.now()}`;
    const baseUploadDir = getUploadDir();
    
    await ensureDirectoryExists(baseUploadDir);
    const uploadDir = path.join(baseUploadDir, leaderId);
    await ensureDirectoryExists(uploadDir);

    const processedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await saveToLocalDisk(file.buffer, leaderId, i, uploadDir);
      processedImages.push(result);
    }

    req.body.images = processedImages;
    req.body.processedImages = processedImages;
    
    next();
  } catch (error) {
    console.error("Error processing images:", error);
    next(error);
  }
};

// Save single image to local disk with multiple sizes - HIGH QUALITY VERSION
const saveToLocalDisk = async (buffer, leaderId, index, uploadDir, options = {}) => {
  const timestamp = Date.now();
  const uniqueId = uuidv4().slice(0, 8);
  const baseFilename = `${leaderId}_${timestamp}_${index}_${uniqueId}`;
  
  // Define sizes for different use cases - HIGH QUALITY settings
  const sizes = {
    original: { width: null, height: null, suffix: "original" },
    large: { width: 1920, height: 1920, suffix: "large" },      // Increased to 1920px
    medium: { width: 1280, height: 1280, suffix: "medium" },    // Increased to 1280px
    small: { width: 640, height: 640, suffix: "small" },        // Increased to 640px
    thumbnail: { width: 300, height: 300, suffix: "thumb" },    // Increased to 300px
    social: { width: 1200, height: 630, suffix: "social" }
  };

  const image = sharp(buffer);
  const metadata = await image.metadata();
  
  const versions = {};
  const savedPaths = {};

  // Process each size with HIGH QUALITY settings
  for (const [key, size] of Object.entries(sizes)) {
    const filename = `${baseFilename}_${size.suffix}.webp`;
    const filepath = path.join(uploadDir, filename);
    // URL path for frontend (will be served by Express static middleware)
    const relativePath = `/uploads/leaders/${leaderId}/${filename}`;

    let processedImage = sharp(buffer);

    if (size.width || size.height) {
      processedImage = processedImage.resize(size.width, size.height, {
        fit: "inside",
        withoutEnlargement: false,  // Changed to false to allow better quality
        kernel: sharp.kernel.lanczos3  // Added best quality kernel
      });
    }

    // Convert to WebP with HIGH QUALITY (85 -> 92)
    const quality = key === 'original' ? 95 : (options.quality || 92);
    await processedImage
      .webp({ 
        quality: quality,
        effort: 6,              // Maximum compression effort for better quality
        smartSubsample: true,   // Smart subsampling for better quality
        alphaQuality: 100       // Maximum alpha quality
      })
      .toFile(filepath);

    versions[key] = {
      path: filepath,
      url: relativePath,
      width: size.width || metadata.width,
      height: size.height || metadata.height
    };
    
    savedPaths[key] = relativePath;
  }

  // Get file sizes
  const stats = await fs.stat(versions.original.path);
  
  return {
    url: versions.original.url,
    public_id: `${leaderId}/${baseFilename}`,
    width: metadata.width,
    height: metadata.height,
    format: "webp",
    bytes: stats.size,
    versions: {
      thumbnail: versions.thumbnail.url,
      medium: versions.medium.url,
      large: versions.large.url,
      social: versions.social.url,
      small: versions.small.url
    },
    metadata: {
      ...metadata,
      processedAt: new Date().toISOString()
    }
  };
};

// Delete local images
const deleteLocalImages = async (publicIds) => {
  const deletePromises = publicIds.map(async (publicId) => {
    const [leaderId, baseFilename] = publicId.split("/");
    const baseUploadDir = getUploadDir();
    const uploadDir = path.join(baseUploadDir, leaderId);
    
    const suffixes = ["original", "large", "medium", "small", "thumb", "social"];
    
    for (const suffix of suffixes) {
      const filename = `${baseFilename}_${suffix}.webp`;
      const filepath = path.join(uploadDir, filename);
      
      try {
        await fs.unlink(filepath);
        console.log(`🗑️ Deleted: ${filepath}`);
      } catch (err) {
        // File might not exist, ignore
      }
    }
  });
  
  await Promise.all(deletePromises);
};

// Bulk delete images
const bulkDeleteLocalImages = async (publicIds) => {
  await deleteLocalImages(publicIds);
};

// Optimize existing image (recompress) - HIGH QUALITY VERSION
const optimizeExistingImage = async (publicId, options = {}) => {
  const [leaderId, baseFilename] = publicId.split("/");
  const baseUploadDir = getUploadDir();
  const uploadDir = path.join(baseUploadDir, leaderId);
  const originalPath = path.join(uploadDir, `${baseFilename}_original.webp`);
  
  try {
    const buffer = await fs.readFile(originalPath);
    const optimized = await sharp(buffer)
      .webp({ 
        quality: options.quality || 92,  // Increased from 80 to 92
        effort: 6,
        smartSubsample: true
      })
      .toBuffer();
    
    await fs.writeFile(originalPath, optimized);
    
    return {
      success: true,
      message: "Image optimized successfully",
      publicId
    };
  } catch (error) {
    throw new Error(`Failed to optimize image: ${error.message}`);
  }
};

// Get local image info
const getLocalImageInfo = async (publicId) => {
  const [leaderId, baseFilename] = publicId.split("/");
  const baseUploadDir = getUploadDir();
  const uploadDir = path.join(baseUploadDir, leaderId);
  const originalPath = path.join(uploadDir, `${baseFilename}_original.webp`);
  
  try {
    const stats = await fs.stat(originalPath);
    const image = sharp(originalPath);
    const metadata = await image.metadata();
    
    return {
      publicId,
      size: stats.size,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
  } catch (error) {
    throw new Error(`Failed to get image info: ${error.message}`);
  }
};

module.exports = {
  processAndSaveImages,
  saveToLocalDisk,
  deleteLocalImages,
  bulkDeleteLocalImages,
  optimizeExistingImage,
  getLocalImageInfo
};