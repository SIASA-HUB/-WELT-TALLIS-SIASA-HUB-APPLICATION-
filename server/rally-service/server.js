require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const Logger = require("./src/utils/logger/logger");
const { initDB, closeDB } = require("./src/configurations/db");

const rallyRoutes = require("./src/routes/rallyRoutes");

const app = express();

// Process error handlers
process.on("uncaughtException", (error) => {
  Logger.error("UNCAUGHT EXCEPTION", {
    message: error.message,
    stack: error.stack,
  });
  console.error("UNCAUGHT EXCEPTION:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  Logger.error("UNHANDLED PROMISE REJECTION", {
    reason: JSON.stringify(reason),
    stack: reason?.stack,
  });
  console.error("UNHANDLED PROMISE REJECTION:", reason);
  setTimeout(() => process.exit(1), 1000);
});

// ==================== CORS CONFIGURATION ====================
// Apply CORS middleware - this handles all routes including OPTIONS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Length", "X-Total-Count"],
    credentials: false,
    optionsSuccessStatus: 200,
  }),
);

// Additional headers for all responses
app.use((req, res, next) => {
  // Set headers for all responses
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin",
  );
  res.header("Access-Control-Expose-Headers", "Content-Length, X-Total-Count");

  // Log requests for debugging
  console.log(
    `📡 ${req.method} ${req.url} - Origin: ${req.headers.origin || "unknown"}`,
  );

  next();
});

// ==================== MIDDLEWARES ====================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ==================== ROUTES ====================
app.use("/api/v1/rallies", rallyRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "rally-service",
    cors: "enabled",
    uptime: process.uptime(),
  });
});

// Test endpoint with CORS info
app.get("/api/v1/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
    cors: "enabled (all origins)",
    timestamp: new Date().toISOString(),
    requestOrigin: req.headers.origin || "none",
  });
});

// Debug routes endpoint
app.get("/api/v1/debug/routes", (req, res) => {
  res.json({
    success: true,
    message: "Routes available",
    routes: [
      "GET /health",
      "GET /api/v1/test",
      "GET /api/v1/debug/routes",
      "GET /api/v1/rallies",
      "POST /api/v1/rallies",
      "GET /api/v1/rallies/:id",
      "PUT /api/v1/rallies/:id",
      "DELETE /api/v1/rallies/:id",
    ],
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.url}`,
    timestamp: Date.now(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  Logger.error("GLOBAL ERROR HANDLER", {
    message: err.message,
    stack: err.stack,
    path: req.url,
  });
  console.error("Global error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    timestamp: Date.now(),
    path: req.url,
  });
});

// ==================== SERVER CONFIGURATION ====================
const PORT = process.env.PORT || 8001;
const HOST = process.env.HOST || "0.0.0.0";

(async () => {
  try {
    console.log("-------------------------------------------");
    console.log("🚀 RALLY SERVICE STARTING");
    console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🌍 Host: ${HOST}:${PORT}`);
    console.log(`🔓 CORS: Enabled for all origins`);
    console.log("-------------------------------------------");

    Logger.info("Starting database", { action: "start_database" });
    await initDB();
    console.log("✅ Database connected");

    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ Server listening on ${HOST}:${PORT}`);
      console.log(`📍 Health check: http://${HOST}:${PORT}/health`);
      console.log(`📍 Test endpoint: http://${HOST}:${PORT}/api/v1/test`);
      console.log(
        `📍 Debug routes: http://${HOST}:${PORT}/api/v1/debug/routes`,
      );
      console.log(`📍 Rallies endpoint: http://${HOST}:${PORT}/api/v1/rallies`);
      console.log("-------------------------------------------");
      console.log("🔗 To expose to internet, run in new terminal:");
      console.log("   cloudflared tunnel --url http://localhost:8001");
      console.log("-------------------------------------------");

      Logger.info("Server running", {
        host: HOST,
        port: PORT,
        action: "server_started",
      });
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("🛑 Shutdown signal received. Closing server...");
      Logger.info("Shutdown signal received. Closing server...");

      server.close(async () => {
        console.log("✅ Server closed");
        await closeDB();
        console.log("✅ Database connection closed");
        Logger.info("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    Logger.error("Failed to start application", {
      message: error.message,
      stack: error.stack,
      action: "startup_failed",
    });
    process.exit(1);
  }
})();
