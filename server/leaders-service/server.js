require("dotenv").config();
console.log("DEBUG: server.js execution started");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const knex = require("knex");
const path = require("path");
const fs = require("fs");

const Logger = require("./src/utils/logger/logger");
// const client = require("prom-client");

// Metrics Disabled
const register = { contentType: 'text/plain', metrics: () => Promise.resolve('') };
const httpRequestDurationMicroseconds = { startTimer: () => () => { } };

const { initDB } = require("./src/configurations/db");
const leaderRoutes = require("./src/routes/Leader");
const battleRoutes = require("./src/routes/battle");
const battleController = require("./src/controllers/BattleController");

const app = express();

// ============================================
// UPLOADS DIRECTORY - CREATE AND SERVE STATIC FILES
// ============================================

// Ensure uploads directory exists inside leaders-service
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory:", uploadsDir);
}

// Create leaders subdirectory inside uploads
const leadersUploadDir = path.join(uploadsDir, "leaders");
if (!fs.existsSync(leadersUploadDir)) {
  fs.mkdirSync(leadersUploadDir, { recursive: true });
  console.log("✅ Created leaders uploads directory:", leadersUploadDir);
}

// Create battles subdirectory inside uploads
const battlesUploadDir = path.join(uploadsDir, "battles");
if (!fs.existsSync(battlesUploadDir)) {
  fs.mkdirSync(battlesUploadDir, { recursive: true });
  console.log("✅ Created battles uploads directory:", battlesUploadDir);
}

/**
 * FIXED STATIC SERVING logic:
 * This handles /uploads/leaders (direct) AND /api/v1/uploads/leaders (via Gateway)
 */
app.use(
  "/uploads/battles",
  express.static(path.join(uploadsDir, "battles"), {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use(
  "/uploads/leaders",
  express.static(path.join(uploadsDir, "leaders"), {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use(
  "/uploads",
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// Log static file requests for debugging
app.use(['/api/v1/uploads', '/uploads'], (req, res, next) => {
  console.log(`📁 Static file request: ${req.method} ${req.originalUrl}`);
  next();
});

// body parsers
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    end({ method: req.method, route, code: res.statusCode });
  });

  if (!req.originalUrl.startsWith('/uploads')) {
    Logger.info("Incoming Request", { method: req.method, path: req.originalUrl, ip: req.ip });
  }
  next();
});

// ============================================
// ROUTES
// ============================================

app.use("/api/v1/leaders", leaderRoutes);
app.use("/api/v1/battles", battleRoutes);

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    uploadsPath: uploadsDir
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  Logger.error("GLOBAL ERROR HANDLER", { message: err.message, stack: err.stack, path: req.originalUrl });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    timestamp: Date.now(),
  });
});

// ============================================
// DATABASE MIGRATIONS
// ============================================

const knexConfig = require("./knexfile");
let db = null;

// Initialize database connection
async function initializeDatabase() {
  try {
    db = knex(knexConfig[process.env.NODE_ENV || "development"]);
    console.log("✅ Database connection created");

    // Test connection
    await db.raw('SELECT 1');
    console.log("✅ Database connection successful");

    return db;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
}

async function runMigrations() {
  console.log("🔄 Starting database migrations...");
  try {
    // Clear any stale migration locks
    try {
      await db.migrate.forceFreeMigrationsLock();
    } catch (e) {
      // Ignore lock clearing errors
    }

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const [batchNo, log] = await db.migrate.latest();
        console.log(`✅ Migrations completed! Batch: ${batchNo}`);
        return true;
      } catch (err) {
        console.log(`Migration attempt ${attempt} failed:`, err.message);
        if (err.message.includes('locked')) {
          try {
            await db.raw('UPDATE knex_migrations_lock SET is_locked = 0');
          } catch (e) { }
        }
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 2000));
        } else {
          console.error("❌ Migration failed after 3 attempts");
          return false;
        }
      }
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    return false;
  }
  return false;
}

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 8006;

let server = null;

async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();

    // Run migrations
    await runMigrations();

    // Initialize database with seed data
    try {
      await initDB();
      console.log("✅ Database initialized with seed data");
    } catch (err) {
      console.error("⚠️ Seed data initialization warning:", err.message);
    }

    // Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`✅ Leaders Service running on port ${PORT}`);
      Logger.info("Server started", { port: PORT });
    });

    // Handle server errors
    server.on('error', (err) => {
      console.error("❌ Server error:", err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down gracefully...");

  if (server) {
    server.close(async () => {
      console.log("HTTP server closed");
      if (db) {
        await db.destroy();
        console.log("Database pool closed");
      }
      process.exit(0);
    });
  } else {
    if (db) {
      await db.destroy();
    }
    process.exit(0);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start the server
startServer();

console.log("DEBUG: server.js execution reached end of file");