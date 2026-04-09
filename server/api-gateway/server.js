const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const proxy = require("express-http-proxy");

// Import global modules for auth and rate-limiting
const globalUtils = require("../global/index");
const { verifyAccessToken } = globalUtils;

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

// Serve static properties securely from disk
const path = require("path");
const staticPath = path.join(__dirname, "../../public/uploads");
app.use("/uploads", express.static(staticPath, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
}));


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
// GLOBAL AUTHENTICATION CHECK
// ============================================
// Verify standard tokens implicitly to pass X-User properties down
app.use((req, res, next) => {
  req.user = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
        req.userId = decoded.userId;
      }
    } catch (err) {
      Logger.warn("Gateway auth check failed", { message: err.message });
    }
  }
  next();
});

// ============================================
// RATE LIMITERS FROM GLOBAL SHARED UTILS
// ============================================
app.use("/api/v1/", globalUtils.apiLimiter);

// Sensitive endpoints get a stricter limit
const sensitiveRoutes = [
  "/api/v1/users/login",
  "/api/v1/users/register",
  "/api/v1/wallet/transactions",
  "/api/v1/wallet/withdraw",
  "/api/v1/wallet/deposit",
];
app.use((req, res, next) => {
  if (sensitiveRoutes.some((route) => req.originalUrl.startsWith(route))) {
    return globalUtils.strictLimiter(req, res, next);
  }
  next();
});

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

    // Forward Centralized Auth metadata
    if (srcReq.user) {
      proxyReqOpts.headers["X-User-Id"] = srcReq.user.userId;
      if (srcReq.user.role) {
        proxyReqOpts.headers["X-User-Role"] = srcReq.user.role;
      }
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

// Battles Routing (proxied to Leaders Service natively)
app.use("/api/v1/battles", proxy(SERVICES.leaders, proxyOptions));

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
// DYNAMIC SEO RENDERER FOR BOTS/CRAWLERS
// ============================================
const axios = require("axios");

app.get("/seo/leader/:id", async (req, res) => {
  try {
    const leaderId = req.params.id;
    // Fetch leader safely using internal network path
    const response = await axios.get(`http://localhost:${PORT}/api/v1/leaders/${leaderId}`);
    
    if (!response.data?.success || !response.data?.data) {
      return res.status(404).send("Leader Not Found");
    }

    const leader = response.data.data;
    const imageUrl = leader.image_url?.startsWith("/") ? `https://siasa-hub.com${leader.image_url}` : leader.image_url;
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>${leader.name} - ${leader.position} for ${leader.county || leader.constituency}</title>
          <meta name="description" content="Check out ${leader.name}'s manifestos and political profile on Siasa Hub. Position: ${leader.position}, Party: ${leader.party || 'Independent'}.">
          
          <!-- OpenGraph / Facebook -->
          <meta property="og:type" content="profile">
          <meta property="og:url" content="https://siasa-hub.com/leaders/${leaderId}">
          <meta property="og:title" content="${leader.name} - ${leader.position}">
          <meta property="og:description" content="View ${leader.name}'s profile, manifestos, and platform on Siasa-Hub.">
          <meta property="og:image" content="${imageUrl}">
          <meta property="og:site_name" content="Siasa Hub">

          <!-- Twitter -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:url" content="https://siasa-hub.com/leaders/${leaderId}">
          <meta name="twitter:title" content="${leader.name} - ${leader.position}">
          <meta name="twitter:description" content="Explore the political profile of ${leader.name} for ${leader.county || leader.constituency}.">
          <meta name="twitter:image" content="${imageUrl}">
      </head>
      <body>
          <h1>${leader.name}</h1>
          <p>${leader.slogan || `Running for ${leader.position}`}</p>
          <img src="${imageUrl}" alt="${leader.name}"/>
          <p>This is a dynamically rendered SEO page for crawlers. Regular users will experience the fully interactive Siasa Hub application.</p>
          <a href="/leaders/${leaderId}">View Interactive Profile</a>
      </body>
      </html>
    `;
    
    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    Logger.error("SEO Renderer failed", { error: err.message, path: req.path });
    res.status(500).send("SEO Engine Error");
  }
});

app.get("/seo/marketplace/product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    // Fetch product safely using internal network path
    const response = await axios.get(`http://localhost:${PORT}/api/v1/marketplace/products/${productId}`);
    
    if (!response.data?.success || !response.data?.data) {
      return res.status(404).send("Product Not Found");
    }

    const product = response.data.data;
    const imageUrl = product.image_url?.startsWith("/") ? `https://siasa-hub.com${product.image_url}` : product.image_url;
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>${product.name} - Siasa Hub Marketplace</title>
          <meta name="description" content="Get your ${product.name} for KES ${product.price} on Siasa Hub's official Merch Store. ${product.description || 'Show your support today!'}">
          
          <!-- OpenGraph / Facebook -->
          <meta property="og:type" content="product">
          <meta property="og:url" content="https://siasa-hub.com/marketplace/product/${productId}">
          <meta property="og:title" content="${product.name} - Official Merch">
          <meta property="og:description" content="Price: KES ${product.price}. Official campaign merchandise available now.">
          <meta property="og:image" content="${imageUrl}">
          <meta property="og:site_name" content="Siasa Hub Store">
          <meta property="product:price:amount" content="${product.price}">
          <meta property="product:price:currency" content="KES">

          <!-- Twitter -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:url" content="https://siasa-hub.com/marketplace/product/${productId}">
          <meta name="twitter:title" content="${product.name} | Siasa Hub Store">
          <meta name="twitter:description" content="Get your ${product.name} for KES ${product.price}. Limited stock!">
          <meta name="twitter:image" content="${imageUrl}">
      </head>
      <body>
          <h1>${product.name}</h1>
          <h2>KES ${product.price}</h2>
          <p>${product.description || 'Official merchandise'}</p>
          <img src="${imageUrl}" alt="${product.name}"/>
          <p>This is a dynamically rendered SEO page for crawlers. Regular users will experience the fully interactive Siasa Hub application.</p>
          <a href="/marketplace/product/${productId}">Go to Store</a>
      </body>
      </html>
    `;
    
    res.set("Content-Type", "text/html");
    res.send(html);
  } catch (err) {
    Logger.error("SEO Product Renderer failed", { error: err.message, path: req.path });
    res.status(500).send("SEO Engine Error");
  }
});

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
