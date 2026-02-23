require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const knex = require("knex");

const redis = require("./src/utils/redis/redis");
const { initDB } = require("./src/configurations/db");
const userRoutes = require("./src/routes/users");
const { corsOptions } = require("./src/helpers/cors/corsConfig");

const app = express();
app.use(cors(corsOptions));
console.log("sevre");

/* =====================================================
   PROCESS-LEVEL ERRORS
===================================================== */
process.on("uncaughtException", (err) => {
  console.error("🔥 [UNCAUGHT EXCEPTION]");
  console.error(err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("🔥 [UNHANDLED REJECTION]");
  console.error(reason);
  setTimeout(() => process.exit(1), 1000);
});

/* =====================================================
   REDIS DEBUG LOGS (keep for now)
===================================================== */
console.log("➡️ Initializing Redis listeners...");

redis.on("connect", () => {
  console.log("✅ [Redis] Connected");
});

redis.on("ready", () => {
  console.log("🟢 [Redis] Ready");
});

redis.on("error", (err) => {
  console.error("❌ [Redis] Error");
  console.error(err);
});

redis.on("close", () => {
  console.warn("⚠️ [Redis] Connection closed");
});

// global
console.log("➡️ Registering middlewares...");

app.set("trust proxy", true);
app.use(helmet());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

console.log("➡️ Registering routes...");
app.use("/api/v1/users", userRoutes);

// s erve r startup
const PORT = process.env.PORT || 9000;
const HOST = process.env.HOST || "0.0.0.0";

///run  migartions

const knexConfig = require("./knexfile");

const db = knex(knexConfig[process.env.NODE_ENV || "development"]);

async function runMigrations() {
  await db.migrate.latest();
  console.log(" Migrations up to date");
}

runMigrations();

(async () => {
  try {
    console.log("🚀 [Server] Starting...");
    console.log("➡️ Initializing database...");

    await initDB();

    console.log("✅ Database initialized");

    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ Server running at http://${HOST}:${PORT}`);
    });

    const shutdown = () => {
      console.warn("🛑 Shutdown signal received");
      server.close(() => {
        console.log("✅ Server closed cleanly");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ [Server] Startup failed");
    console.error(err);
    process.exit(1);
  }
})();
