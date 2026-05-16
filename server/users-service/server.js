require("dotenv").config();
// Forced restart to pick up global secret changes

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

const knex = require("knex");

const redis = require("./src/utils/redis/redis");
const { initDB, pool } = require("./src/configurations/db");
const userRoutes = require("./src/routes/users");
const corsMiddleware = require("../global/middlewares/corsMiddleware");
const knexConfig = require("./knexfile");
const db = knex(knexConfig[process.env.NODE_ENV || "development"]);
const client = require("prom-client");

// Prometheus Metrics Setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

const app = express();


process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);

  const isConnectionError = [
    'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'
  ].includes(err.code);

  if (!isConnectionError && !err.message.toLowerCase().includes('redis')) {
    process.exit(1);
  }
});


/* =====================================================
   REDIS EVENTS
===================================================== */
redis.on("connect", () => console.log(" Redis connected"));
redis.on("ready", () => console.log(" Redis ready"));
redis.on("error", (err) => console.error(" Redis error:", err));
redis.on("close", () => console.warn(" Redis closed"));

/* =====================================================
   MIDDLEWARES
===================================================== */
app.set("trust proxy", true);
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
  }),
);
const cookieParser = require("cookie-parser");

app.use(corsMiddleware);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());

// Metrics Middleware
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    end({ method: req.method, route, code: res.statusCode });
  });
  next();
});
/* =====================================================
   ROUTES
===================================================== */
// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "users-service",
    time: new Date().toISOString(),
  });
});

app.use("/api/v1/users", userRoutes);


/* =====================================================
   SERVER CONFIG
===================================================== */
const PORT = process.env.PORT || 8002;
const HOST = process.env.HOST || "0.0.0.0";

// Database configuration already initialized at top
const dbConfig = require("./src/configurations/db");

async function seedAdmin() {
  const adminEmail = 'siasahubadmin@gmail.co.ke';
  const bcrypt = require("bcrypt");

  try {
    const admin = await dbConfig.safeQueryOne(`SELECT * FROM users WHERE email = ?`, [adminEmail]);
    if (!admin) {
      const hashedPassword = await bcrypt.hash('SiasaHubAdmin@2024!', 10);
      await dbConfig.safeQuery(
        `INSERT INTO users (user_id, name, email, password, role, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        ['ADM-001', 'SiasaHub Super Admin', adminEmail, hashedPassword, 'admin', 1]
      );
      console.log("✅ Default admin account seeded successfully");
    } else if (admin.role !== 'admin') {
      await dbConfig.safeQuery(`UPDATE users SET role = 'admin', is_verified = 1 WHERE email = ?`, [adminEmail]);
      console.log("✅ Updated existing user to admin role");
    }
  } catch (err) {
    console.error("❌ Failed to seed admin account:", err.message);
  }
}

async function startServer() {
  try {
    console.log(" Starting server...");

    await initDB();
    console.log(" Database initialized");

    try {
      await db.migrate.latest();
      console.log("✅ Migrations up to date");
    } catch (migrateErr) {
      console.warn("⚠️ Migrations failed (non-fatal):", migrateErr.message);
    }

    try {
      await seedAdmin();
      console.log("✅ Admin seeding checked");
    } catch (seedErr) {
      console.warn("⚠️ Admin seeding failed:", seedErr.message);
    }

    const server = app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });

    /* Graceful shutdown */
    const shutdown = () => {
      console.log(" Shutting down...");
      server.close(() => {
        console.log(" Server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error(" Fatal error during server startup:", err);
    process.exit(1);
  }
}

startServer();
