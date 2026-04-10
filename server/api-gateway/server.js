const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const proxy = require("express-http-proxy");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();

// Configuration
const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "0.0.0.0";

// Service URLs
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

// Proxy options
const proxyOptions = {
  proxyReqPathResolver: (req) => req.originalUrl.replace(/^\/api\/v1/, ""),
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.headers.authorization) {
      proxyReqOpts.headers["Authorization"] = srcReq.headers.authorization;
    }
    return proxyReqOpts;
  },
  timeout: 30000,
  proxyErrorHandler: (err, res) => {
    log("Proxy error:", err.message);
    res.status(503).json({ success: false, message: "Service temporarily unavailable" });
  },
};

// Service proxies
app.use("/api/v1/leaders", proxy(SERVICES.leaders, proxyOptions));
app.use("/api/v1/battles", proxy(SERVICES.leaders, proxyOptions));
app.use("/api/v1/media", proxy(SERVICES.media, proxyOptions));
app.use("/api/v1/rallies", proxy(SERVICES.rallies, proxyOptions));
app.use("/api/v1/users", proxy(SERVICES.users, proxyOptions));
app.use("/api/v1/wallet", proxy(SERVICES.wallet, proxyOptions));
app.use("/api/v1/endorsements", proxy(SERVICES.endorsement, proxyOptions));
app.use("/api/v1/marketplace", proxy(SERVICES.marketplace, proxyOptions));
app.use("/api/v1/reactions", proxy(SERVICES.reaction, proxyOptions));

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