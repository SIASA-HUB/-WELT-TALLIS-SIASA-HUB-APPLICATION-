require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const path = require("path");
const corsMiddleware = require("../global/middlewares/corsMiddleware");

// ============================================
// SIMPLE CONSOLE LOGGER (fallback)
// ============================================
const consoleLogger = {
  info: (...args) => console.log("[INFO]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
  debug: (...args) => console.debug("[DEBUG]", ...args),
};

let logger = consoleLogger;
let db = null;

// Try to load shared modules
try {
  const shared = require("../shared");
  if (shared && shared.logger) logger = shared.logger;
  if (shared && shared.db) db = shared.db;
} catch (error) {
  // Use fallback logger
}

// Import wallet routes
let walletRoutes;
try {
  walletRoutes = require("./src/routes/walletRoutes");
} catch (error) {
  console.error("Failed to load wallet routes:", error.message);
  process.exit(1);
}

const app = express();

// ============================================
// CORS CONFIGURATION
// ============================================
// Define allowed origins for CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'];

// Apply CORS middleware with allowed origins
app.use(corsMiddleware);

// ============================================
// PROCESS ERROR HANDLERS
// ============================================
process.on("uncaughtException", (error) => {
  logger.error("UNCAUGHT EXCEPTION", {
    message: error.message,
    stack: error.stack,
  });
  setTimeout(() => process.exit(1), 1000);
});

process.on("unhandledRejection", (reason) => {
  logger.error("UNHANDLED PROMISE REJECTION", {
    stack: reason?.stack || reason,
  });
  setTimeout(() => process.exit(1), 1000);
});

// ============================================
// MIDDLEWARES
// ============================================
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
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging (only in development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    logger.debug(
      `[Wallet] ${req.method} ${req.path} - Origin: ${req.headers.origin}`,
    );
    next();
  });
}

// ============================================
// ROUTES
// ============================================
// Mount wallet routes
if (walletRoutes) {
  app.use("/api/v1/wallet", walletRoutes);
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "wallet-service",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins,
      requestOrigin: req.headers.origin || null,
    },
  });
});

// Test CORS endpoint (optional - useful for debugging)
app.get("/cors-test", (req, res) => {
  res.status(200).json({
    message: "CORS test endpoint",
    allowedOrigins: allowedOrigins,
    requestOrigin: req.headers.origin || null,
    isAllowed: req.headers.origin ? allowedOrigins.includes(req.headers.origin) : false,
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  logger.error("GLOBAL ERROR", {
    message: err.message,
    path: req.originalUrl,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 8008;
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    // Initialize database if available
    if (db && db.initDB) {
      await db.initDB();
    }

    const server = app.listen(PORT, HOST, () => {
      logger.info(`✅ Wallet Service running on port ${PORT}`);
      logger.info(`📍 CORS allowed origins: ${allowedOrigins.join(", ")}`);
      logger.info(`🔧 Test CORS: http://${HOST}:${PORT}/cors-test`);
      logger.info(`🔍 Health check: http://${HOST}:${PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = () => {
      logger.info("Shutting down wallet service...");
      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error("❌ Failed to start wallet service:", error.message);
    process.exit(1);
  }
};

startServer();