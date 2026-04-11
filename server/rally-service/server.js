require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const corsMiddleware = require("../global/middlewares/corsMiddleware");

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
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  Logger.error("UNHANDLED PROMISE REJECTION", {
    reason: JSON.stringify(reason),
    stack: reason?.stack,
  });
  setTimeout(() => process.exit(1), 1000);
});

// CORS middleware
app.use(corsMiddleware);

// ==================== MIDDLEWARES ====================
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
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ==================== ROUTES ====================
app.use("/api/v1/rallies", rallyRoutes);

// API Reference (disabled for production)
// app.use("/reference", apiReference({ ... }));

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
    Logger.info("Starting database", { action: "start_database" });
    await initDB();

    const server = app.listen(PORT, HOST, () => {
      Logger.info("Server running", {
        host: HOST,
        port: PORT,
        action: "server_started",
      });
    });

    // Graceful shutdown
    const shutdown = async () => {
      Logger.info("Shutdown signal received. Closing server...");

      server.close(async () => {
        await closeDB();
        Logger.info("Server closed.");
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