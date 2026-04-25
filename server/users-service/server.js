require("dotenv").config();
// Forced restart to pick up global secret changes

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

const knex = require("knex");

const redis = require("./src/utils/redis/redis");
const { initDB } = require("./src/configurations/db");
const userRoutes = require("./src/routes/users");
const corsMiddleware = require("../global/middlewares/corsMiddleware");
const knexConfig = require("./knexfile");
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


  if (err.code !== 'ECONNREFUSED' && err.code !== 'ENOTFOUND') {
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
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

const db = knex(knexConfig[process.env.NODE_ENV || "development"]);

async function startServer() {
  try {
    console.log(" Starting server...");

    await initDB();
    console.log(" Database initialized");

    await db.migrate.latest();
    console.log(" Migrations up to date");

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
