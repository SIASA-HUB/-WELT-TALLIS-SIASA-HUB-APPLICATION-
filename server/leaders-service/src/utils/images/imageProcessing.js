const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
const multer = require("multer");
const Logger = require("../logger/logger");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 10,
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
      "image/avif",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid image format"), false);
    }
    cb(null, true);
  },
});

/**
 * Upload to Cloudinary with High-DPI support
 */
const uploadToCloudinary = (buffer, publicId = null) =>
  new Promise((resolve, reject) => {
    const finalPublicId =
      publicId ||
      `leader_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: finalPublicId,
        folder: "leaders_profiles",
        resource_type: "image",
        // Primary High-Quality Version
        transformation: [
          { width: 2500, crop: "limit" }, // High limit for 4k/Retina screens
          { dpr: "auto" }, // CRITICAL: Serves sharp images on mobile
          { quality: "auto:best" }, // Let Cloudinary optimize based on the device
          { fetch_format: "auto" },
          { flags: "preserve_transparency" },
        ],
        eager: [
          {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face",
            quality: "auto:best",
            format: "webp",
          },
          {
            width: 800,
            height: 800,
            crop: "fill",
            gravity: "face",
            quality: "auto:best",
            format: "webp",
          },
          {
            width: 1200,
            height: 630,
            crop: "fill",
            gravity: "face",
            quality: 90,
            format: "jpg",
          },
        ],
        eager_async: false,
      },
      (error, result) => {
        if (error) return reject(error);

        const response = {
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          versions: {
            original: result.secure_url,
            // Constructing URLs that include the DPR auto flag for mobile sharpness
            thumbnail: result.secure_url.replace(
              "/upload/",
              "/upload/w_400,h_400,c_fill,g_face,dpr_auto,q_auto:best/",
            ),
            medium: result.secure_url.replace(
              "/upload/",
              "/upload/w_800,h_800,c_fill,g_face,dpr_auto,q_auto:best/",
            ),
            large: result.secure_url, // Use original for large display
          },
        };
        resolve(response);
      },
    );
    stream.end(buffer);
  });

/**
 * Process with Sharp (Metadata & Rotation focus)
 */
const processAndUploadImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    const uploadedImages = await Promise.all(
      req.files.map(async (file, index) => {
        try {
          const metadata = await sharp(file.buffer).metadata();
          let processedBuffer;

          // Only use Sharp for critical corrections, keep quality at 100
          let pipeline = sharp(file.buffer).rotate().withMetadata();

          if (file.mimetype === "image/png") {
            pipeline = pipeline.png({ quality: 100, compressionLevel: 6 });
          } else if (file.mimetype !== "image/gif") {
            pipeline = pipeline
              .resize(2500, 2500, { fit: "inside", withoutEnlargement: true })
              .jpeg({
                quality: 100,
                chromaSubsampling: "4:4:4",
                force: false,
              });
          }

          processedBuffer =
            file.mimetype === "image/gif"
              ? file.buffer
              : await pipeline.toBuffer();

          const result = await uploadToCloudinary(processedBuffer);
          return { ...result, index, original_filename: file.originalname };
        } catch (err) {
          Logger.error(
            "Sharp processing failed, falling back to original",
            err,
          );
          return await uploadToCloudinary(file.buffer);
        }
      }),
    );

    const successfulUploads = uploadedImages.filter((img) => img !== null);
    req.body.images = successfulUploads;
    req.body.primary_image_url = successfulUploads[0]?.url;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

module.exports = {
  uploadMultiple: upload.array("images", 10),
  processAndUploadImages,
  deleteMediaFromCloudinary: async (id) =>
    await cloudinary.uploader.destroy(id),
};
