const express = require("express");
const Logger = require("./src/utils/logger/logger");

// Process error handlers
process.on("uncaughtException", (error) => {
  Logger.error("🔥 UNCAUGHT EXCEPTION", { message: error.message, stack: error.stack });
  const isConnectionError = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(error.code);
  if (!isConnectionError && !error.message.toLowerCase().includes('redis')) {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason) => {
  Logger.error("🌀 UNHANDLED PROMISE REJECTION", { message: reason?.message || reason, stack: reason?.stack });
});

const helmet = require("helmet");
const path = require("path");
const dotenv = require("dotenv");
const multer = require("multer");
const fs = require("fs");
const knex = require("knex");
const client = require("prom-client");

// Prometheus Metrics Setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);


// Load environment variables
dotenv.config();

// Import local modules
const corsMiddleware = require("../global/middlewares/corsMiddleware");
const { initDB, safeQuery } = require("./src/configurations/db");
const knexConfig = require("./knexfile");

// Initialize knex
const environment = process.env.NODE_ENV || "development";
const db = knex(knexConfig[environment]);

// Import routes with error handling
let productRoutes, cartRoutes, orderRoutes;
try {
  productRoutes = require("./src/routes/productRoutes");
  cartRoutes = require("./src/routes/cartRoutes");
  orderRoutes = require("./src/routes/orderRoutes");
  console.log("✅ Routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load routes:", error.message);
  // Create fallback routes
  const router = express.Router();
  router.get("/", (req, res) => {
    res.status(500).json({ error: "Route module failed to load", details: error.message });
  });
  productRoutes = router;
  cartRoutes = router;
  orderRoutes = router;
}

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

// ============ MIDDLEWARE ============

// CORS configuration
app.use(corsMiddleware);

// Metrics Middleware
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    end({ method: req.method, route, code: res.statusCode });
  });
  next();
});

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        "style-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        "img-src": ["*", "data:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ============ STATIC FILES ============
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
  }
}));

// ============ TEST ROUTE ============
app.get("/ping", (req, res) => {
  res.json({ message: "pong", timestamp: Date.now() });
});

// ============ API ROUTES ============

// Upload endpoint
app.post("/api/v1/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const folder = req.body.folder || "products";
    const imageUrl = `/uploads/${folder}/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    Logger.error("Upload error:", { error: error.message });
    res.status(500).json({
      success: false,
      error: "Failed to upload image",
    });
  }
});

// API Routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);



// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

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

// Debug endpoint - Check if products table exists
app.get("/debug/tables", async (req, res) => {
  try {
    const tables = await safeQuery("SHOW TABLES");
    const productsExist = await safeQuery("SHOW TABLES LIKE 'products'");
    res.json({
      success: true,
      allTables: tables.map(row => Object.values(row)[0]),
      productsTableExists: productsExist.length > 0,
      message: productsExist.length > 0 ? "✅ Products table exists" : "❌ Products table MISSING"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ ERROR HANDLERS ============

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
  Logger.error("Error:", { error: err.message });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ============ SERVER STARTUP ============

const startServer = async () => {
  try {
    // Run migrations
    console.log("🔄 Running database migrations...");
    await db.migrate.latest();
    console.log("✅ Migrations completed successfully");

    // Create uploads directory
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Initialize database connection
    await initDB();
    Logger.info("✅ Database connected successfully");

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      Logger.info(`🚀 Marketplace service running on port ${PORT}`);
      console.log(`
  ═══════════════════════════════════════════════════════
  📡 Local:            http://localhost:${PORT}
  📦 Products API:     http://localhost:${PORT}/api/v1/products
  🛒 Cart API:         http://localhost:${PORT}/api/v1/user/cart
  📸 Upload API:       http://localhost:${PORT}/api/v1/upload
  💚 Health Check:     http://localhost:${PORT}/health
  🔧 Debug Tables:     http://localhost:${PORT}/debug/tables
  ═══════════════════════════════════════════════════════
      `);
    });
  } catch (error) {
    Logger.error("Failed to start server:", error);
    console.error("❌ Failed to start server:", error.message);
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

// Start the server
startServer();