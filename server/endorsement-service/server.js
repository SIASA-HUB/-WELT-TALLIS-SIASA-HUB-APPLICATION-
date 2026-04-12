// server.js
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const corsMiddleware = require("../global/middlewares/corsMiddleware");

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

// CORS middleware
app.use(corsMiddleware);

// Security headers but relaxed for CORS
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        "style-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net", "http://localhost:*", "https://*.ballot.com"],
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
// FIXED: Multiple possible upload locations
// ============================================

// Possible upload directories (in order of priority)
const possibleUploadPaths = [
  path.join(__dirname, "src", "uploads"),           // src/uploads
  path.join(__dirname, "uploads"),                   // root/uploads
  path.join(__dirname, "..", "uploads"),             // parent/uploads
  path.join(process.cwd(), "uploads"),               // cwd/uploads
];

let actualUploadsPath = null;

// Find the actual uploads directory
for (const testPath of possibleUploadPaths) {
  if (fs.existsSync(testPath)) {
    actualUploadsPath = testPath;
    console.log(`✅ Found uploads directory: ${actualUploadsPath}`);
    break;
  }
}

// If none exists, create one
if (!actualUploadsPath) {
  actualUploadsPath = path.join(__dirname, "src", "uploads");
  fs.mkdirSync(actualUploadsPath, { recursive: true });
  fs.mkdirSync(path.join(actualUploadsPath, "endorsements"), { recursive: true });
  console.log(`📁 Created uploads directory: ${actualUploadsPath}`);
}

Logger.info(`📁 Serving static files from: ${actualUploadsPath}`);

// ============================================
// SERVE STATIC FILES FROM MULTIPLE LOCATIONS
// ============================================

// Primary static serving from actual uploads directory
app.use(
  "/uploads",
  (req, res, next) => {
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  },
  express.static(actualUploadsPath, {
    maxAge: "30d",
    immutable: true,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
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
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  }),
);

// Also serve from src/uploads if different
const srcUploadsPath = path.join(__dirname, "src", "uploads");
if (srcUploadsPath !== actualUploadsPath && fs.existsSync(srcUploadsPath)) {
  app.use("/uploads", express.static(srcUploadsPath));
  console.log(`📁 Also serving from: ${srcUploadsPath}`);
}

// Serve from root uploads as well
const rootUploadsPath = path.join(__dirname, "uploads");
if (rootUploadsPath !== actualUploadsPath && fs.existsSync(rootUploadsPath)) {
  app.use("/uploads", express.static(rootUploadsPath));
  console.log(`📁 Also serving from: ${rootUploadsPath}`);
}

// ============================================
// DEBUG ENDPOINT - Check image URLs
// ============================================
app.get("/api/v1/debug/images", (req, res) => {
  try {
    const endorsementsDir = path.join(actualUploadsPath, "endorsements");
    const result = {
      uploadsPath: actualUploadsPath,
      endorsementsDirExists: fs.existsSync(endorsementsDir),
      files: [],
    };

    if (fs.existsSync(endorsementsDir)) {
      const years = fs.readdirSync(endorsementsDir);
      for (const year of years) {
        const yearPath = path.join(endorsementsDir, year);
        if (fs.statSync(yearPath).isDirectory()) {
          const months = fs.readdirSync(yearPath);
          for (const month of months) {
            const monthPath = path.join(yearPath, month);
            if (fs.statSync(monthPath).isDirectory()) {
              const files = fs.readdirSync(monthPath);
              files.forEach(file => {
                result.files.push({
                  path: `/uploads/endorsements/${year}/${month}/${file}`,
                  fullPath: path.join(monthPath, file),
                  size: fs.statSync(path.join(monthPath, file)).size,
                });
              });
            }
          }
        }
      }
    }

    res.json({
      success: true,
      data: result,
      sampleUrls: result.files.slice(0, 5).map(f => ({
        url: f.path,
        testUrl: `http://localhost:${PORT}${f.path}`
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// Routes
app.use("/api/v1/endorsements", endorsementRoutes);

// Test CORS endpoint
app.get("/cors-test", (req, res) => {
  res.json({
    message: "CORS is working!",
    timestamp: Date.now(),
    headers: req.headers,
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
    Logger.info(" Migrations completed successfully");
  } catch (error) {
    Logger.error(" Migration error:", {
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

      Logger.info(`📁 Static files served from: ${actualUploadsPath}`);
      Logger.info(`📸 Test image URL: http://${HOST}:${PORT}/uploads/endorsements/`);
      Logger.info(`🔍 Debug images: http://${HOST}:${PORT}/api/v1/debug/images`);
      Logger.info(`🧪 Test CORS: http://${HOST}:${PORT}/cors-test`);

      Logger.info(`📁 Static files served from: ${actualUploadsPath}`);
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