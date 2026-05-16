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
const db = knex(knexConfig[process.env.NODE_ENV || "development"]);

async function runMigrations() {
  console.log("🔄 Starting database migrations...");
  let migrationsCompleted = false;
  try {
    try {
      await db.migrate.forceFreeMigrationsLock();
    } catch (e) { }

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const [batchNo, log] = await db.migrate.latest();
        console.log(`✅ Migrations completed! Batch: ${batchNo}`);
        migrationsCompleted = true;
        break;
      } catch (err) {
        if (err.message.includes('locked')) {
          await db.raw('UPDATE knex_migrations_lock SET is_locked = 0');
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  }
  return migrationsCompleted;
}

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 8006;

const server = app.listen(PORT, () => {
  console.log(` Leaders Service running on port ${PORT}`);
  Logger.info("Server started", { port: PORT });

  // Run background tasks AFTER server starts
  (async () => {
    try {
      console.log("🔄 Checking migrations...");
      await runMigrations();
      console.log("✅ Migrations check complete.");

      console.log("🚀 Initializing Database...");
      await initDB();
      console.log("✅ Database initialized.");
    } catch (err) {
      console.error("❌ Background startup task failed:", err);
    }
  })();
});

// Handle server errors
server.on('error', (err) => {
  console.error("❌ Server failed to bind:", err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
  }
  process.exit(1);
});

const shutdown = () => {
  console.log("Shutting down...");
  server.close(async () => {
    await db.destroy();
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log("DEBUG: server.js execution reached end of file");

console.log("DEBUG: server.js execution reached end of file");
