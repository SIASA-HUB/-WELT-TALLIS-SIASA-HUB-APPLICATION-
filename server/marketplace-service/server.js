const express = require("express");
const helmet = require("helmet");

const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const { initDB, safeQuery } = require("./src/configurations/db");
const Logger = require("./src/utils/logger/logger");
const multer = require("multer");
const fs = require("fs");
const knex = require("knex");
const knexConfig = require("./knexfile");
const { apiReference } = require("@scalar/express-api-reference");

dotenv.config();

// Allowed origins
const allowedOrigins = [
  "https://reseller-add-banana-api.trycloudflare.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

// Initialize knex
const environment = process.env.NODE_ENV || "development";
const db = knex(knexConfig[environment]);

// Import routes
const productRoutes = require("./src/routes/productRoutes");
const cartRoutes = require("./src/routes/cartRoutes");

const app = express();
const PORT = process.env.PORT || 8004;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || "products";
    const uploadPath = path.join(__dirname, "uploads", folder);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "product-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and WEBP are allowed."));
    }
  },
});

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Origin",
    ],
    exposedHeaders: ["Content-Length", "X-Total-Count"],
  }),
);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        "style-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static images from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Upload endpoint
app.post("/api/v1/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const folder = req.body.folder || "products";
    const imageUrl = `/api/v1/uploads/${folder}/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload image",
    });
  }
});

// API Routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);

// API Reference
app.use(
  "/reference",
  apiReference({
    spec: {
      content: {
        openapi: "3.1.0",
        info: { title: "Marketplace Service API", version: "1.0.0" },
        paths: {
          "/api/v1/products": { get: { summary: "Products APIs", responses: { "200": { description: "Success" } } } }
        }
      }
    }
  })
);

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await safeQuery("SELECT 1");
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: "Marketplace service running",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  Logger.error("Server error:", err);
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Run migrations and start server
const startServer = async () => {
  try {
    // Run migrations first
    console.log(" Running database migrations...");
    await db.migrate.latest();
    console.log(" Migrations completed successfully");

    // Create uploads directory
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    await initDB();
    Logger.info("✅ Database connected successfully");

    // Listen on all network interfaces
    app.listen(PORT, "0.0.0.0", () => {
      Logger.info(`🚀 Marketplace service running on port ${PORT}`);
      console.log(`                                                       
  📡 Local: http://localhost:${PORT}                                                                                          
  📦 Products API: /api/v1/products                             
  🛒 Cart API: /api/v1/cart                                     
   📸 Upload API: /api/v1/upload 
      `);
    });
  } catch (error) {
    Logger.error("Failed to start server:", error);
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  Logger.info("Shutting down gracefully...");
  await db.destroy();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  Logger.info("Shutting down gracefully...");
  await db.destroy();
  process.exit(0);
});

startServer();
