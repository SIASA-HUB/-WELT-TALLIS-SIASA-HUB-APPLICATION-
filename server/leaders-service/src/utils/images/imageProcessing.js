const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
const multer = require("multer");
const Logger = require("../logger/logger");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Increase timeout for Cloudinary
cloudinary.config({
  timeout: 120000, // 120 seconds timeout
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Reduce to 5MB (from 20MB)
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
 * Upload to Cloudinary with timeout and retry
 */
const uploadToCloudinary = (buffer, publicId = null, retries = 2) => {
  return new Promise(async (resolve, reject) => {
    const finalPublicId =
      publicId ||
      `leader_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Compress image before upload to reduce size
    let processedBuffer = buffer;
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Resize if image is too large (max 1200px)
      if (metadata.width > 1200 || metadata.height > 1200) {
        processedBuffer = await image
          .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        Logger.info(
          `Image resized from ${metadata.width}x${metadata.height} to 1200x1200`,
        );
      }
    } catch (err) {
      Logger.warn("Sharp compression failed, using original:", err.message);
    }

    const uploadWithRetry = async (attempt) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: finalPublicId,
          folder: "leaders_profiles",
          resource_type: "image",
          timeout: 60000, // 60 seconds timeout
          transformation: [
            { quality: "auto:good" }, // Reduced from best to good for speed
            { fetch_format: "auto" },
          ],
          eager: [
            {
              width: 400,
              height: 400,
              crop: "fill",
              gravity: "face",
              quality: "auto:good",
              format: "webp",
            },
            {
              width: 800,
              height: 800,
              crop: "fill",
              gravity: "face",
              quality: "auto:good",
              format: "webp",
            },
          ],
          eager_async: true, // Make eager transformations async for speed
        },
        (error, result) => {
          if (error) {
            if (attempt < retries) {
              Logger.warn(`Upload attempt ${attempt + 1} failed, retrying...`);
              setTimeout(() => uploadWithRetry(attempt + 1), 1000);
            } else {
              reject(error);
            }
          } else {
            const response = {
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
              versions: {
                original: result.secure_url,
                thumbnail: result.eager?.[0]?.secure_url || result.secure_url,
                medium: result.eager?.[1]?.secure_url || result.secure_url,
              },
            };
            resolve(response);
          }
        },
      );
      stream.end(processedBuffer);
    };

    uploadWithRetry(0);
  });
};

/**
 * Process and upload images (supports both single and multiple files)
 */
const processAndUploadImages = async (req, res, next) => {
  try {
    // Set timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Image processing timeout")), 90000);
    });

    const processingPromise = (async () => {
      // Handle single file upload (from aspirant registration)
      if (req.file) {
        Logger.info(
          `Processing single image: ${req.file.originalname} (${req.file.size} bytes)`,
        );

        const result = await uploadToCloudinary(req.file.buffer);

        req.processedImages = [
          {
            ...result,
            index: 0,
            original_filename: req.file.originalname,
            is_primary: true,
          },
        ];

        req.body.primary_image_url = result.url;
      }
      // Handle multiple files upload (from admin create)
      else if (req.files && req.files.length > 0) {
        Logger.info(`Processing ${req.files.length} images`);

        // Process images in parallel with limit
        const batchSize = 3;
        const results = [];

        for (let i = 0; i < req.files.length; i += batchSize) {
          const batch = req.files.slice(i, i + batchSize);
          const batchResults = await Promise.all(
            batch.map(async (file, idx) => {
              Logger.info(
                `Processing image ${i + idx + 1}: ${file.originalname} (${file.size} bytes)`,
              );
              return await uploadToCloudinary(file.buffer);
            }),
          );
          results.push(...batchResults);
        }

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

    await Promise.race([processingPromise, timeoutPromise]);
  } catch (error) {
    Logger.error("Image processing error:", error);

    // Send appropriate error response
    if (error.message === "Image processing timeout") {
      return res.status(408).json({
        success: false,
        message: "Image upload timed out. Please try with a smaller image.",
      });
    }

    if (error.message.includes("File size too large")) {
      return res.status(400).json({
        success: false,
        message: "Image file is too large. Maximum size is 5MB.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Image upload failed. Please try again with a smaller image.",
    });
  }
};

/**
 * Delete media from Cloudinary
 */
const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    Logger.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

/**
 * Bulk delete from Cloudinary
 */
const bulkDeleteFromCloudinary = async (publicIds) => {
  try {
    const results = await Promise.all(
      publicIds.map((id) => cloudinary.uploader.destroy(id)),
    );
    return results;
  } catch (error) {
    Logger.error("Error bulk deleting from Cloudinary:", error);
    throw error;
  }
};

/**
 * Optimize existing image
 */
const optimizeExistingImage = async (publicId) => {
  try {
    const optimized = {
      url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/q_auto:good,f_auto/${publicId}`,
      thumbnail: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_400,h_400,c_fill,g_face,q_auto:good,f_auto/${publicId}`,
      medium: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_800,h_800,c_fill,g_face,q_auto:good,f_auto/${publicId}`,
    };
    return optimized;
  } catch (error) {
    Logger.error("Error optimizing image:", error);
    throw error;
  }
};

/**
 * Get image info
 */
const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    Logger.error("Error getting image info:", error);
    throw error;
  }
};

module.exports = {
  uploadMultiple,
  uploadSingle,
  processAndUploadImages,
  uploadToCloudinary,
  deleteMediaFromCloudinary,
  bulkDeleteFromCloudinary,
  optimizeExistingImage,
  getImageInfo,
};
