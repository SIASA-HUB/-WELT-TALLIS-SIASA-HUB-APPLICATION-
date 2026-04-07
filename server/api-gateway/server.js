const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const proxy = require("express-http-proxy");
const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");

const redis = require("./src/utils/redis/redis");
const app = express();

// configuration
const PORT = Number(process.env.PORT) || 8009;
const HOST = process.env.HOST || "0.0.0.0";

// Service URLs with fallbacks
const SERVICES = {
  leaders: process.env.LEADERS_SERVICE_URL || "http://localhost:8006",
  media: process.env.MEDIA_SERVICE_URL || "http://localhost:8007",
  rallies: process.env.RALLY_SERVICE_URL || "http://localhost:8001",
  users: process.env.USERS_SERVICE_URL || "http://localhost:8002",
  wallet: process.env.WALLET_SERVICE_URL || "http://localhost:8008",
  endorsement: process.env.ENDORSEMENT_SERVICE_URL || "http://localhost:8003",
  marketplace: process.env.MARKETPLACE_SERVICE_URL || "http://localhost:8004",
  reaction: process.env.REACTION_SERVICE_URL || "http://localhost:8005",
};

// Logger
const Logger = {
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ""),
  warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ""),
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || ""),
};

// ============================================
// CORS - Properly configured without wildcard routes
// ============================================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-CSRF-Token",
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

// Security middleware (relaxed for development)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  Logger.info("Incoming Request", {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    origin: req.headers.origin,
  });
  next();
});

// ============================================
// RATE LIMITERS - Fixed with proper configuration
// ============================================

// Helper function for IPv6-safe key generation
const ipKeyGenerator = (req) => {
  // For IPv6, use the /64 subnet to prevent IP rotation bypass
  let ip = req.ip || req.connection.remoteAddress;
  if (ip && ip.includes(":")) {
    // IPv6 - mask to /64 subnet
    const parts = ip.split(":");
    if (parts.length >= 4) {
      ip = parts.slice(0, 4).join(":") + "::/64";
    }
  }
  return ip;
};

// Create separate Redis store instances for each limiter
let apiLimiter, sensitiveLimiter;

try {
  // Store for general API limiter
  const apiRedisStore = new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:api:",
  });

  apiLimiter = rateLimit({
    store: apiRedisStore,
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300, // 300 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: ipKeyGenerator,
    validate: {
      keyGeneratorIpFallback: false, // Disable IPv6 validation since we handle it
      unsharedStore: false, // We're using separate stores
    },
    message: {
      success: false,
      message: "Too many requests. Please slow down.",
    },
  });

  // Store for sensitive endpoints limiter
  const sensitiveRedisStore = new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:sensitive:",
  });

  sensitiveLimiter = rateLimit({
    store: sensitiveRedisStore,
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: ipKeyGenerator,
    validate: {
      keyGeneratorIpFallback: false,
      unsharedStore: false,
    },
    handler: (req, res) => {
      Logger.warn("Sensitive endpoint rate limit hit", { ip: req.ip });
      res.status(429).json({
        success: false,
        message: "Too many attempts. Try again later.",
      });
    },
  });

  app.use(apiLimiter);
} catch (error) {
  Logger.error("Redis rate limiter error, falling back to memory store", error);
  const memoryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    keyGenerator: ipKeyGenerator,
    message: {
      success: false,
      message: "Too many requests. Please slow down.",
    },
    validate: {
      keyGeneratorIpFallback: false,
    },
  });
  app.use(memoryLimiter);
}

// ============================================
// PROXY OPTIONS
// ============================================
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    // Remove /api/v1 prefix when forwarding to services
    const path = req.originalUrl.replace(/^\/api\/v1/, "");
    Logger.info(`Proxying to: ${path}`);
    return path;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // Forward important headers
    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers["X-Forwarded-For"] = srcReq.ip;
    proxyReqOpts.headers["X-Forwarded-Host"] = srcReq.headers.host;
    proxyReqOpts.headers["X-Forwarded-Proto"] = srcReq.protocol;

    // Forward auth headers if present
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers["Authorization"] = srcReq.headers.authorization;
    }
    if (srcReq.headers["x-csrf-token"]) {
      proxyReqOpts.headers["X-CSRF-Token"] = srcReq.headers["x-csrf-token"];
    }

    return proxyReqOpts;
  },
  timeout: 30000,
  proxyErrorHandler: (err, res, next) => {
    Logger.error("Proxy error", err);
    res.status(503).json({
      success: false,
      message: "Service temporarily unavailable",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  },
};

// ============================================
// SERVICE PROXIES
// ============================================

// Leaders Service
app.use("/api/v1/leaders", proxy(SERVICES.leaders, proxyOptions));

// Media Service
app.use("/api/v1/media", proxy(SERVICES.media, proxyOptions));

// Rallies Service
app.use("/api/v1/rallies", proxy(SERVICES.rallies, proxyOptions));

// Users Service
app.use("/api/v1/users", proxy(SERVICES.users, proxyOptions));

// Wallet Service
app.use("/api/v1/wallet", proxy(SERVICES.wallet, proxyOptions));

// Endorsement Service
app.use("/api/v1/endorsements", proxy(SERVICES.endorsement, proxyOptions));

// Marketplace Service
app.use("/api/v1/marketplace", proxy(SERVICES.marketplace, proxyOptions));

// Reaction Service
app.use("/api/v1/reactions", proxy(SERVICES.reaction, proxyOptions));

// ============================================
// HEALTH AND UTILITY ENDPOINTS
// ============================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    services: SERVICES,
  });
});

// Service health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Gateway is running",
    timestamp: Date.now(),
  });
});

// ============================================
// 404 HANDLER - Using middleware instead of app.all("*")
// ============================================
// This middleware catches all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  Logger.error("GLOBAL ERROR HANDLER", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ============================================
// PROCESS SAFETY
// ============================================
process.on("uncaughtException", (error) => {
  Logger.error("UNCAUGHT EXCEPTION", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  Logger.error("UNHANDLED PROMISE REJECTION", reason);
  process.exit(1);
});

// ============================================
// START SERVER
// ============================================
const server = app.listen(PORT, HOST, () => {
  console.log("=================================");
  console.log(`🚀 API GATEWAY RUNNING`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Host: ${HOST}`);
  console.log(`🔧 Services:`);
  Object.entries(SERVICES).forEach(([name, url]) => {
    console.log(`   - ${name}: ${url}`);
  });
  console.log(`🌐 CORS: All origins allowed`);
  console.log(`🔒 Rate Limiting: Enabled (300 req/15min)`);
  console.log("=================================");

  Logger.info("Server running", { host: HOST, port: PORT });
});

// Shutdown handler
const shutdown = async () => {
  Logger.info("Shutdown signal received");

  server.close(async () => {
    try {
      if (redis && redis.quit) {
        await redis.quit();
      }
    } catch (err) {
      Logger.error("Error closing Redis", err);
    }
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
