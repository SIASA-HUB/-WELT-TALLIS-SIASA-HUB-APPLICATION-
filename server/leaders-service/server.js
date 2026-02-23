require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const knex = require("knex");

const Logger = require("./src/utils/logger/logger");
const { initDB } = require("./src/configurations/db");
const leaderRoutes = require("./src/routes/leaderRoutes");
const { corsOptions } = require("./src/helpers/cors/corsConfig"); // your CORS file

const app = express();

//process   erro   handler
process.on("uncaughtException", (error) => {
  Logger.error("UNCAUGHT EXCEPTION", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  Logger.error("UNHANDLED PROMISE REJECTION", {
    stack: reason?.stack || reason,
  });
  setTimeout(() => process.exit(1), 1000);
});

//middlewares
app.use(helmet());
app.use(cors());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

//  request logging for dev/prod
app.use((req, res, next) => {
  Logger.info("Incoming Request", {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });
  next();
});

//routes

app.use("/api/v1/leaders", leaderRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

//global  erro handler
app.use((err, req, res, next) => {
  Logger.error("GLOBAL ERROR HANDLER", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    timestamp: Date.now(),
  });
});

//  run migrations

const knexConfig = require("./knexfile");

const db = knex(knexConfig[process.env.NODE_ENV || "development"]);

async function runMigrations() {
  await db.migrate.latest();
  console.log(" Migrations up to date");
}

runMigrations();

//server   configurations
const PORT = process.env.PORT || 8006;
const HOST = process.env.HOST || "0.0.0.0";
//start  server  and  database
(async () => {
  try {
    console.log({
      port: PORT,
    });
    Logger.info("Starting database", { action: "start_database" });
    await initDB();

    const server = app.listen(PORT, HOST, () => {
      Logger.info("Server running", {
        host: HOST,
        port: PORT,
        action: "server_started",
      });
    });

    //shutdown
    const shutdown = () => {
      Logger.info("Shutdown signal received. Closing server...");
      server.close(async () => {
        Logger.info("Server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    Logger.error("Failed to start application", {
      message: error.message,
      stack: error.stack,
      action: "startup_failed",
    });
    process.exit(1);
  }
})();
