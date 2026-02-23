const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const cors = require("cors");
const knex = require("knex");

console.log("🔍 DEBUG: Starting server with detailed logging");
console.log("Step 0: Imports loaded");

try {
  console.log("Step 1: Creating Express app");
  const app = express();
  console.log(" Express app created");

  console.log("Step 2: Creating HTTP server");
  const httpServer = createServer(app);
  console.log(" HTTP server created");

  console.log("Step 3: Configuring CORS (simple version first)");
  // Start with simplest possible CORS
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST"],
    }),
  );
  console.log(" Basic CORS configured");

  console.log("Step 4: Adding request logger middleware");
  app.use((req, res, next) => {
    console.log(` ${req.method} ${req.url}`);
    next();
  });
  console.log(" Logger middleware added");

  console.log("Step 5: Configuring JSON middleware");
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log(" JSON middleware added");

  console.log("Step 6: Setting up Socket.IO");
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });
  console.log("Socket.IO configured");

  console.log("Step 7: Setting up Redis (with error handling)");
  let redis;
  try {
    redis = createClient();
    console.log(" Redis client created");
  } catch (redisError) {
    console.error(" Redis creation failed:", redisError.message);
  }

  console.log("Step 8: Setting up Knex");
  const knexConfig = require("./knexfile");
  console.log(" Knex config loaded");

  let db;
  try {
    db = knex(knexConfig[process.env.NODE_ENV || "development"]);
    console.log(" Knex initialized");
  } catch (knexError) {
    console.error("Knex init failed:", knexError.message);
  }

  console.log("Step 9: Adding health check route");
  app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });
  console.log(" Health route added");

  console.log("Step 10: Loading poll routes");
  try {
    const pollRoutes = require("./src/routes/polls");
    app.use("/api/v1/polls", pollRoutes);
    console.log(" Poll routes loaded");
  } catch (routesError) {
    console.error(" Routes error:", routesError.message);
    console.error(routesError.stack);
  }

  console.log("Step 11: Starting server...");
  const PORT = process.env.PORT || 9002;
  const HOST = process.env.HOST || "0.0.0.0";

  httpServer.listen(PORT, HOST, () => {
    console.log("\n SERVER STARTED SUCCESSFULLY ");
    console.log(` http://${HOST}:${PORT}`);
    console.log(` Health: http://${HOST}:${PORT}/health`);
    console.log(` Polls: http://${HOST}:${PORT}/api/v1/polls\n`);
  });

  httpServer.on("error", (error) => {
    console.error(" Server error:", error);
  });
} catch (error) {
  console.error("\n CRASH AT STEP:", error.message);
  console.error(error.stack);
}
