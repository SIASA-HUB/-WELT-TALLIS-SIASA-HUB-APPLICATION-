const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { apiReference } = require("@scalar/express-api-reference");

const app = express();

// Configuration
const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "0.0.0.0";

// Service URLs
const SERVICES = {
  leaders: process.env.LEADERS_SERVICE_URL || "http://leaders-service:8006",
  media: process.env.MEDIA_SERVICE_URL || "http://media-service:8007",
  rallies: process.env.RALLY_SERVICE_URL || "http://rally-service:8001",
  users: process.env.USERS_SERVICE_URL || "http://users-service:8002",
  wallet: process.env.WALLET_SERVICE_URL || "http://wallet-service:8008",
  endorsement: process.env.ENDORSEMENT_SERVICE_URL || "http://endorsement-service:8003",
  marketplace: process.env.MARKETPLACE_SERVICE_URL || "http://marketplace-service:8004",
  reaction: process.env.REACTION_SERVICE_URL || "http://reaction-service:8005",
};

// Simple logger
const log = (msg, data = "") => console.log(`[${new Date().toISOString()}] ${msg}`, data);

// Simple in-memory rate limiter (no Redis needed)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for sensitive routes
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: "Too many requests to sensitive endpoint." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files
const staticPath = path.join(__dirname, "../../public/uploads");
app.use("/uploads", express.static(staticPath, { maxAge: '1y' }));

// Request logger
app.use((req, res, next) => {
  log(`${req.method} ${req.originalUrl}`, { ip: req.ip });
  next();
});

// Apply rate limiters
app.use("/api/v1/", apiLimiter);

// Stricter limits for sensitive routes
const sensitiveRoutes = ["/api/v1/users/login", "/api/v1/users/register", "/api/v1/wallet/transactions"];
app.use((req, res, next) => {
  if (sensitiveRoutes.some(route => req.originalUrl.startsWith(route))) {
    return strictLimiter(req, res, next);
  }
  next();
});

// Proxy generator function using http-proxy-middleware v3 syntax
const createProxy = (targetUrl) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Explicitly return the original URL to bypass Express app.use path stripping
      return req.originalUrl;
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        if (req.headers.authorization) {
          proxyReq.setHeader("Authorization", req.headers.authorization);
        }
      },
      error: (err, req, res) => {
        log("Proxy error:", err.message);
        if (!res.headersSent) {
          res.status(503).json({ success: false, message: "Service temporarily unavailable" });
        }
      }
    }
  });
};

app.use("/api/v1/leaders", createProxy(SERVICES.leaders));
app.use("/api/v1/battles", createProxy(SERVICES.leaders));
app.use("/api/v1/media", createProxy(SERVICES.media));
app.use("/api/v1/rallies", createProxy(SERVICES.rallies));
app.use("/api/v1/users", createProxy(SERVICES.users));
app.use("/api/v1/wallet", createProxy(SERVICES.wallet));
app.use("/api/v1/endorsements", createProxy(SERVICES.endorsement));
app.use("/api/v1/marketplace", createProxy(SERVICES.marketplace));
app.use("/api/v1/reactions", createProxy(SERVICES.reaction));


// API Reference
app.use(
  "/reference",
  apiReference({
    spec: {
      content: {
        openapi: "3.1.0",
        info: { title: "API Gateway (Siasa Hub)", version: "1.0.0" },
        paths: {
          "/api/v1/users": { get: { summary: "Gateway User APIs", responses: { "200": { description: "Success" } } } }
        }
      }
    }
  })
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API Gateway is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use((err, req, res, next) => {
  log("Error:", err.message);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log("\n=================================");
  console.log(`🚀 API GATEWAY RUNNING`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Host: ${HOST}`);
  console.log(`🔧 Services:`);
  Object.entries(SERVICES).forEach(([name, url]) => {
    console.log(`   - ${name}: ${url}`);
  });
  console.log("=================================\n");
});

// Graceful shutdown
process.on("SIGINT", () => {
  log("Shutting down...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  log("Shutting down...");
  server.close(() => process.exit(0));
});