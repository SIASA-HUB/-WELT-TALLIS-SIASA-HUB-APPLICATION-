// utils/images/localImageProcessing.js

const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Ensure upload directories exist
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Process and save images to local disk with Sharp
const processAndSaveImages = async (files, leaderId, options = {}) => {
  const results = [];
  const uploadDir = path.join(__dirname, "../../uploads/leaders", leaderId);
  
  await ensureDirectoryExists(uploadDir);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await saveToLocalDisk(file.buffer, leaderId, i, uploadDir, options);
    results.push(result);
  }

  return results;
};

// Save single image to local disk with multiple sizes
const saveToLocalDisk = async (buffer, leaderId, index, uploadDir, options = {}) => {
  const timestamp = Date.now();
  const uniqueId = uuidv4().slice(0, 8);
  const baseFilename = `${leaderId}_${timestamp}_${index}_${uniqueId}`;
  
  // Define sizes for different use cases
  const sizes = {
    original: { width: null, height: null, suffix: "original" },
    large: { width: 1200, height: 1200, suffix: "large" },
    medium: { width: 800, height: 800, suffix: "medium" },
    small: { width: 400, height: 400, suffix: "small" },
    thumbnail: { width: 150, height: 150, suffix: "thumb" },
    social: { width: 1200, height: 630, suffix: "social" } // For social media sharing
  };

  const image = sharp(buffer);
  const metadata = await image.metadata();
  
  const versions = {};
  const savedPaths = {};

  // Process each size
  for (const [key, size] of Object.entries(sizes)) {
    const filename = `${baseFilename}_${size.suffix}.webp`;
    const filepath = path.join(uploadDir, filename);
    const relativePath = `/uploads/leaders/${leaderId}/${filename}`;

    let processedImage = sharp(buffer);

    if (size.width || size.height) {
      processedImage = processedImage.resize(size.width, size.height, {
        fit: "inside",
        withoutEnlargement: true
      });
    }

    // Convert to WebP for better compression and quality
    await processedImage
      .webp({ quality: options.quality || 85 })
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
    const uploadDir = path.join(__dirname, "../../uploads/leaders", leaderId);
    
    const suffixes = ["original", "large", "medium", "small", "thumb", "social"];
    
    for (const suffix of suffixes) {
      const filename = `${baseFilename}_${suffix}.webp`;
      const filepath = path.join(uploadDir, filename);
      
      try {
        await fs.unlink(filepath);
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

// Optimize existing image (recompress)
const optimizeExistingImage = async (publicId, options = {}) => {
  const [leaderId, baseFilename] = publicId.split("/");
  const uploadDir = path.join(__dirname, "../../uploads/leaders", leaderId);
  const originalPath = path.join(uploadDir, `${baseFilename}_original.webp`);
  
  try {
    const buffer = await fs.readFile(originalPath);
    const optimized = await sharp(buffer)
      .webp({ quality: options.quality || 80 })
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
  const uploadDir = path.join(__dirname, "../../uploads/leaders", leaderId);
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