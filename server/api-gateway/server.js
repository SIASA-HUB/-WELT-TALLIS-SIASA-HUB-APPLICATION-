const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { apiReference } = require("@scalar/express-api-reference");
const Logger = require("./src/utils/logger/logger");

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
app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost origin or any port on localhost for dev ease
    if (!origin || origin.startsWith('http://localhost:')) return callback(null, true);
    
    const allowed = [
      'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000',
      'http://localhost:8080',
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ];
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not permitted`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','x-csrf-token'],
}));

app.use(helmet({ 
  contentSecurityPolicy: false, 
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Apply rate limiters
app.use("/api/v1/", apiLimiter);

// Route-specific strict limits (applied BEFORE general limiter)
const AUTH_LIMITER = rateLimit({ windowMs: 15*60*1000, max: 5, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' } });
const WALLET_LIMITER = rateLimit({ windowMs: 10*60*1000, max: 15, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many wallet requests. Please wait.' } });
const VOTE_LIMITER = rateLimit({ windowMs: 60*1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Voting rate limit exceeded.' } });

app.use((req, res, next) => {
  if (req.originalUrl.match(/\/users\/(login|register|refresh)/)) return AUTH_LIMITER(req, res, next);
  if (req.originalUrl.startsWith('/api/v1/wallet')) return WALLET_LIMITER(req, res, next);
  if (req.originalUrl.includes('/manifestos/vote')) return VOTE_LIMITER(req, res, next);
  next();
});

// Proxy generator 
const createProxy = (targetUrl) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    proxyTimeout: 120000, // 2 minutes
    timeout: 120000,      // 2 minutes
    pathRewrite: (path, req) => {
      
      return req.originalUrl;
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        if (req.headers.authorization) {
          proxyReq.setHeader("Authorization", req.headers.authorization);
        }
      },
      error: (err, req, res) => {
        Logger.error(`Proxy error for ${req.url}: ${err.message}`);
        if (!res.headersSent) {
          res.status(503).json({ success: false, message: "Service temporarily delayed or unavailable" });
        }
      }
    }
  });

};

// ============================================
// UPLOADS PROXY (EACH SERVICE SERVES ITS OWN IMAGES)
// ============================================

// Proxy uploads to their respective services
app.use("/uploads/leaders", createProxy(SERVICES.leaders));
app.use("/uploads/endorsements", createProxy(SERVICES.endorsement));
app.use("/uploads/marketplace", createProxy(SERVICES.marketplace));
app.use("/uploads/rallies", createProxy(SERVICES.rallies));
app.use("/uploads/users", createProxy(SERVICES.users));
app.use("/uploads/products", createProxy(SERVICES.marketplace));


// ============================================
// SERVICE PROXY ROUTES
// ============================================

app.use("/api/v1/leaders", createProxy(SERVICES.leaders));
app.use("/api/v1/battles", createProxy(SERVICES.leaders));
app.use("/api/v1/media", createProxy(SERVICES.media));
app.use("/api/v1/rallies", createProxy(SERVICES.rallies));
app.use("/api/v1/users", createProxy(SERVICES.users));
app.use("/api/v1/wallet", createProxy(SERVICES.wallet));
app.use("/api/v1/endorsements", createProxy(SERVICES.endorsement));
app.use("/api/v1/products", createProxy(SERVICES.marketplace));
app.use("/api/v1/orders", createProxy(SERVICES.marketplace));
app.use("/api/v1/cart", createProxy(SERVICES.marketplace));
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
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: Date.now() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use((err, req, res, next) => {
  Logger.error(`Internal Server Error: ${err.message}`);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start server
const server = app.listen(PORT, HOST, () => {

  Object.entries(SERVICES).forEach(([name, url]) => {
    console.log(`   - ${name}: ${url}`);
  });

});

// Graceful shutdown
process.on("SIGINT", () => {
  Logger.info("Shutting down API Gateway...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  log("Shutting down...");
  server.close(() => process.exit(0));
});