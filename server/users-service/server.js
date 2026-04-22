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
        "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
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
/* =====================================================
   ROUTES
===================================================== */
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
