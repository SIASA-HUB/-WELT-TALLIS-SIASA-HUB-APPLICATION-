const dotenv = require("dotenv");
dotenv.config();
const Logger = require("./src/utils/logger/logger");

// Process error handlers
process.on("uncaughtException", (error) => {
  Logger.error("🔥 UNCAUGHT EXCEPTION", { message: error.message, stack: error.stack });
  const isConnectionError = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(error.code);
  if (!isConnectionError) {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason) => {
  Logger.error("🌀 UNHANDLED PROMISE REJECTION", { message: reason?.message || reason, stack: reason?.stack });
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { apiReference } = require("@scalar/express-api-reference");
// const client = require("prom-client");

// Metrics Disabled
const register = { contentType: 'text/plain', metrics: () => Promise.resolve('') };
const httpRequestDurationMicroseconds = { startTimer: () => () => {} };

const app = express();

// Metrics Middleware Disabled

// Configuration
const PORT = Number(process.env.PORT) || 8009;
const HOST = process.env.HOST || "0.0.0.0";

// Service URLs
const SERVICES = {
  leaders: (process.env.LEADERS_SERVICE_URL || "http://localhost:8006").trim(),
  media: (process.env.MEDIA_SERVICE_URL || "http://localhost:8007").trim(),
  rallies: (process.env.RALLY_SERVICE_URL || "http://localhost:8001").trim(),
  users: (process.env.USERS_SERVICE_URL || "http://localhost:8002").trim(),
  wallet: (process.env.WALLET_SERVICE_URL || "http://localhost:8008").trim(),
  endorsement: (process.env.ENDORSEMENT_SERVICE_URL || "http://localhost:8003").trim(),
  marketplace: (process.env.MARKETPLACE_SERVICE_URL || "http://localhost:8004").trim(),
  reaction: (process.env.REACTION_SERVICE_URL || "http://localhost:8005").trim(),
  socketio: (process.env.SOCKETIO_SERVICE_URL || "http://localhost:8010").trim(),
  mpesa: (process.env.MPESA_SERVICE_URL || "http://localhost:8011").trim(),
};


// Simple in-memory rate limiter (no Redis needed)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased limit for smoother experience
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
      'http://localhost:8080', 'https://siasahub.co.ke',
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ];
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not permitted`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token'],
}));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Body parsers — only for non-proxied routes (health, sitemap, etc.)

app.use((req, res, next) => {
  const isProxied = req.path.startsWith('/api/v1/') || req.path.startsWith('/uploads/') || req.path.startsWith('/socket.io');
  if (isProxied) return next(); // skip body parser — let proxy forward raw body
  express.json({ limit: "1mb" })(req, res, next);
});
app.use((req, res, next) => {
  const isProxied = req.path.startsWith('/api/v1/') || req.path.startsWith('/uploads/') || req.path.startsWith('/socket.io');
  if (isProxied) return next();
  express.urlencoded({ extended: true, limit: "1mb" })(req, res, next);
});


// Apply rate limiters
app.use("/api/v1/", apiLimiter);

// Route-specific strict limits (applied BEFORE general limiter)
const AUTH_LIMITER = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 50 in dev, 10 in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' }
});


const WALLET_LIMITER = rateLimit({ windowMs: 10 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many wallet requests. Please wait.' } });
const VOTE_LIMITER = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Voting rate limit exceeded.' } });

app.use((req, res, next) => {
  if (req.originalUrl.match(/\/users\/(login|register|refresh)/)) return AUTH_LIMITER(req, res, next);
  if (req.originalUrl.startsWith('/api/v1/wallet')) return WALLET_LIMITER(req, res, next);
  if (req.originalUrl.includes('/manifestos/vote')) return VOTE_LIMITER(req, res, next);
  next();
});

// ============================================
// PROXY CONFIGURATION
// ============================================

const proxyOptions = {
  changeOrigin: true,
  proxyTimeout: 90000,
  timeout: 90000,
  on: {
    proxyReq: (proxyReq, req) => {
      // Ensure headers are forwarded
      if (req.headers.authorization) proxyReq.setHeader("Authorization", req.headers.authorization);
      if (req.headers.cookie) proxyReq.setHeader("Cookie", req.headers.cookie);
      
      // Fix for POST/PUT requests with body-parser
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.headers['content-type']) {
        proxyReq.setHeader('Content-Type', req.headers['content-type']);
      }
      
      Logger.info(`[PROXY] ${req.method} ${req.originalUrl} → ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    },
    error: (err, req, res) => {
      Logger.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: "Service temporarily unavailable",
          path: req.originalUrl
        });
      }
    }
  }
};

// Route mapping
const routes = [
  { path: ["/api/v1/leaders", "/api/v1/battles", "/uploads/leaders", "/uploads/battles"], target: SERVICES.leaders },
  { path: ["/api/v1/marketplace", "/uploads/marketplace", "/api/v1/products", "/uploads/products", "/api/v1/upload", "/api/v1/orders", "/api/v1/cart"], target: SERVICES.marketplace },
  { path: ["/api/v1/users", "/uploads/users"], target: SERVICES.users },
  { path: ["/api/v1/mpesa"], target: SERVICES.mpesa },
  { path: ["/api/v1/rallies", "/uploads/rallies"], target: SERVICES.rallies },
  { path: ["/api/v1/endorsements", "/uploads/endorsements"], target: SERVICES.endorsement },
  { path: ["/api/v1/media", "/uploads/media"], target: SERVICES.media },
  { path: ["/api/v1/wallet"], target: SERVICES.wallet },
  { path: ["/api/v1/reaction", "/api/v1/reactions"], target: SERVICES.reaction },
];

// Mount proxies
routes.forEach(route => {
  app.use(route.path, createProxyMiddleware({
    ...proxyOptions,
    target: route.target,
    pathRewrite: (path, req) => req.originalUrl, // Use originalUrl to keep full path including query
  }));
});

// Socket.IO Proxy
const socketProxy = createProxyMiddleware({
  ...proxyOptions,
  target: SERVICES.socketio,
  ws: true,
  logLevel: 'debug'
});
app.use('/socket.io', socketProxy);

// ============================================
// SITEMAP.XML — Dynamic sitemap for Google crawling
// ============================================
const SITE_URL = process.env.SITE_URL || "https://siasahub.co.ke";

// Lightweight internal HTTP fetch helper with timeout
const fetchInternal = (url, timeoutMs = 5000) => new Promise((resolve) => {
  const http = require("http");
  const request = http.get(url, (res) => {
    let data = "";
    res.on("data", chunk => { data += chunk; });
    res.on("end", () => {
      try { resolve(JSON.parse(data)); }
      catch { resolve(null); }
    });
  });

  request.on("error", () => resolve(null));
  request.setTimeout(timeoutMs, () => {
    request.destroy();
    resolve(null);
  });
});

app.get("/sitemap.xml", async (req, res) => {
  try {
    let leaderUrls = [];
    let productUrls = [];

    // Fetch up to 5000 leaders with slugs and updated_at
    try {
      const leadersData = await fetchInternal(`${SERVICES.leaders}/api/v1/leaders/all?limit=5000`);
      const leaders = leadersData?.data || leadersData?.leaders || [];
      leaderUrls = leaders
        .filter(l => l.slug && l.slug.trim() !== '')
        .map(l => `
  <url>
    <loc>${SITE_URL}/leader/${l.slug}</loc>
    <lastmod>${l.updated_at ? l.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);
    } catch (_) { /* non-fatal */ }

    // Fetch up to 5000 products with slugs
    try {
      const productsData = await fetchInternal(`${SERVICES.marketplace}/api/v1/products?limit=5000`);
      const products = productsData?.data || [];
      productUrls = products
        .filter(p => p.slug && p.slug.trim() !== '')
        .map(p => `
  <url>
    <loc>${SITE_URL}/product/${p.slug}</loc>
    <lastmod>${p.updated_at ? p.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
    } catch (_) { /* non-fatal */ }

    // Static pages
    const staticUrls = [
      { url: "/", priority: "1.0", freq: "daily" },
      { url: "/leaders", priority: "0.9", freq: "daily" },
      { url: "/marketplace", priority: "0.9", freq: "daily" },
      { url: "/register", priority: "0.6", freq: "monthly" },
      { url: "/login", priority: "0.5", freq: "monthly" },
    ].map(({ url, priority, freq }) => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("")}
${leaderUrls.join("")}
${productUrls.join("")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (error) {
    Logger.error(`Sitemap error: ${error.message}`);
    res.status(500).send("<!-- Sitemap generation failed -->");
  }
});

// robots.txt
app.get("/robots.txt", (req, res) => {
  res.header("Content-Type", "text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /aspirant-dashboard
Disallow: /marketplace-admin

Sitemap: ${SITE_URL}/sitemap.xml
`);
});


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

// Metrics endpoint - Disabled
/*
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
*/

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
const server = app.listen(PORT, () => {
  Logger.info(` API Gateway running on port ${PORT}`);
  Object.entries(SERVICES).forEach(([name, url]) => {
    console.log(`   - ${name}: ${url}`);
  });
});

// Handle WebSocket upgrades
server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/socket.io")) {
    socketProxy.upgrade(req, socket, head);
  }
});

// Graceful shutdown
process.on("SIGINT", () => {
  Logger.info("Shutting down API Gateway...");
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  Logger.info("Shutting down API Gateway (SIGTERM)...");
  server.close(() => process.exit(0));
});