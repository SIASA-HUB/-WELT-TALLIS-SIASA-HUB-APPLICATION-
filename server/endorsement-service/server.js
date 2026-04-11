// server.js
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { apiReference } = require("@scalar/express-api-reference");
const knex = require("knex");
const Logger = require("./src/utils/logger/logger");
const { initDB } = require("./src/configurations/db");
const endorsementRoutes = require("./src/routes/endorsementRoutes");

const app = express();

// Process error handlers
process.on("uncaughtException", (error) => {
  Logger.error("UNCAUGHT EXCEPTION", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  Logger.error("UNHANDLED PROMISE REJECTION", {
    stack: reason?.stack || reason,
  });
  setTimeout(() => process.exit(1), 1000);
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "https://tour-bestsellers-conditional-tunnel.trycloudflare.com",
  "http://127.0.0.1:5174",
  "https://your-cloudflare-tunnel.trycloudflare.com", // Add your Cloudflare tunnel URL
  // Add any other origins you need
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(null, false); // Blocked, but return false instead of error
      // Or use: callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "x-csrf-token",
    "Accept",
  ],
  exposedHeaders: ["Set-Cookie"],
  exposedHeaders: ["Content-Length", "X-Requested-With"],
  credentials: true, // Important for cookies
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

app.use(cors(corsOptions));

// REMOVED: app.options("*", cors(corsOptions)); - this causes the error
// Express's cors middleware automatically handles OPTIONS preflight requests

// Security headers but relaxed for CORS
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
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ============================================
// FIXED: Images are actually saved in src/uploads
// ============================================
const uploadsPath = path.join(__dirname, "src", "uploads");

console.log("=".repeat(60));
console.log("📁 STATIC FILE SERVING CONFIGURATION:");
console.log("Server directory:", __dirname);
console.log("Serving static files from:", uploadsPath);
console.log("Directory exists:", fs.existsSync(uploadsPath));

// Check if the directory exists and what's in it
if (fs.existsSync(uploadsPath)) {
  const contents = fs.readdirSync(uploadsPath);
  console.log("Uploads directory contents:", contents);

  const endorsementsPath = path.join(uploadsPath, "endorsements");
  if (fs.existsSync(endorsementsPath)) {
    console.log("✅ Endorsements directory exists");
    const years = fs.readdirSync(endorsementsPath);
    console.log("Years:", years);

    // Check 2026 folder
    const year2026Path = path.join(endorsementsPath, "2026");
    if (fs.existsSync(year2026Path)) {
      const months = fs.readdirSync(year2026Path);
      console.log("Months in 2026:", months);

      // Check March folder
      const marchPath = path.join(year2026Path, "03");
      if (fs.existsSync(marchPath)) {
        const files = fs.readdirSync(marchPath);
        console.log(`📸 Found ${files.length} images in March`);
        if (files.length > 0) {
          console.log("Sample images:", files.slice(0, 3));
        }
      }
    }
  } else {
    console.log("⚠️ Endorsements directory not found, creating...");
    fs.mkdirSync(endorsementsPath, { recursive: true });
  }
} else {
  console.log("⚠️ Uploads directory not found, creating...");
  fs.mkdirSync(uploadsPath, { recursive: true });
  fs.mkdirSync(path.join(uploadsPath, "endorsements"), { recursive: true });
}
console.log("=".repeat(60));

// Serve static files from the correct uploads directory with CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    // Add CORS headers for static files
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight for static files
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  },
  express.static(uploadsPath, {
    maxAge: "30d",
    immutable: true,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Log every image request for debugging
      console.log("📸 Serving file:", path.basename(filePath));

      // Set proper content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext === ".jpg" || ext === ".jpeg") {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (ext === ".png") {
        res.setHeader("Content-Type", "image/png");
      } else if (ext === ".webp") {
        res.setHeader("Content-Type", "image/webp");
      } else if (ext === ".gif") {
        res.setHeader("Content-Type", "image/gif");
      }

      // Enable CORS for images
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  }),
);

// Request logging
app.use((req, res, next) => {
  Logger.info("Incoming Request", {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    origin: req.headers.origin,
  });
  next();
});

// Routes
app.use("/api/v1/endorsements", endorsementRoutes);

// API Reference
app.use(
  "/reference",
  apiReference({
    spec: {
      content: {
        openapi: "3.1.0",
        info: { title: "Endorsement Service API", version: "1.0.0" },
        paths: {
          "/api/v1/endorsements": { get: { summary: "Endorsement APIs", responses: { "200": { description: "Success" } } } }
        }
      }
    }
  })
);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    cors_enabled: true,
  });
});

// CORS test endpoint
app.get("/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    method: req.method,
  });
});

// Debug endpoint to list directories
app.get("/api/v1/debug/directories", (req, res) => {
  const paths = {
    current_dir: __dirname,
    uploads_path: uploadsPath,
    uploads_exists: fs.existsSync(uploadsPath),
  };

  let files = {};

  if (fs.existsSync(uploadsPath)) {
    files.root = fs.readdirSync(uploadsPath);

    const endorsementsFullPath = path.join(uploadsPath, "endorsements");
    if (fs.existsSync(endorsementsFullPath)) {
      files.endorsements = fs.readdirSync(endorsementsFullPath);

      // Check each year folder
      const years = fs.readdirSync(endorsementsFullPath);
      for (const year of years) {
        const yearPath = path.join(endorsementsFullPath, year);
        if (fs.statSync(yearPath).isDirectory()) {
          files[`${year}_files`] = fs.readdirSync(yearPath);

          // Check month folders
          const months = fs.readdirSync(yearPath);
          for (const month of months) {
            const monthPath = path.join(yearPath, month);
            if (fs.statSync(monthPath).isDirectory()) {
              files[`${year}_${month}_files`] = fs.readdirSync(monthPath);
            }
          }
        }
      }
    }
  }

  res.json({ paths, files });
});

// Debug endpoint to check a specific image
app.get("/api/v1/debug/image/:year/:month/:filename", (req, res) => {
  const { year, month, filename } = req.params;

  const imagePath = path.join(
    uploadsPath,
    "endorsements",
    year,
    month,
    filename,
  );
  const exists = fs.existsSync(imagePath);

  res.json({
    requested: { year, month, filename },
    path: imagePath,
    exists: exists,
    size: exists ? fs.statSync(imagePath).size : null,
    url: `/uploads/endorsements/${year}/${month}/${filename}`,
    full_url: `http://localhost:${PORT}/uploads/endorsements/${year}/${month}/${filename}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  Logger.error("GLOBAL ERROR HANDLER", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    timestamp: Date.now(),
  });
});

// Knex configuration
const knexConfig = require("./knexfile");
const environment = process.env.NODE_ENV || "development";
const db = knex(knexConfig[environment]);

// Run migrations function
async function runMigrations() {
  try {
    Logger.info("Running database migrations...", { environment });
    await db.migrate.latest();
    Logger.info("✅ Migrations completed successfully");
  } catch (error) {
    Logger.error("❌ Migration error:", {
      error: error.message,
      stack: error.stack,
    });
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

// Server configuration
const PORT = process.env.PORT || 8003;
const HOST = process.env.HOST || "0.0.0.0";

// Start server and database
(async () => {
  try {
    await runMigrations();
    await initDB();

    const server = app.listen(PORT, HOST, () => {
      Logger.info("Server running", {
        host: HOST,
        port: PORT,
        action: "server_started",
        environment,
      });
      Logger.info(`📁 Static files served from: ${uploadsPath}`);
      Logger.info(
        `📸 Images accessible at: http://${HOST}:${PORT}/api/v1/uploads/endorsements/`,
      );
      Logger.info(
        `🔍 Debug endpoint: http://${HOST}:${PORT}/api/v1/debug/directories`,
      );
      Logger.info(`🌐 CORS enabled for all origins`);
      Logger.info(`🧪 Test CORS: http://${HOST}:${PORT}/api/v1/cors-test`);
    });

    const shutdown = async () => {
      Logger.info("Shutdown signal received. Closing server...");
      server.close(async () => {
        Logger.info("Server closed.");
        await db.destroy();
        Logger.info("Database connection closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    Logger.error("Failed to start application", {
      message: error.message,
      stack: error.stack,
      action: "startup_failed",
    });
    process.exit(1);
  }
})();
