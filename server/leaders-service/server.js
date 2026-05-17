require("dotenv").config();
console.log("=".repeat(50));
console.log("DEBUG: server.js execution started");
console.log("=".repeat(50));

const express = require("express");
const path = require("path");
const fs = require("fs");

console.log("✓ Loading modules...");

// Import your actual routes
const leaderRoutes = require("./src/routes/Leader");
const battleRoutes = require("./src/routes/battle");
const { initDB } = require("./src/configurations/db");

const app = express();
const PORT = process.env.PORT || 8006;

// ============================================
// UPLOADS DIRECTORY
// ============================================
const uploadsDir = path.join(__dirname, "uploads");
const leadersUploadDir = path.join(uploadsDir, "leaders");
const battlesUploadDir = path.join(uploadsDir, "battles");

[uploadsDir, leadersUploadDir, battlesUploadDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  }
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Static files
app.use("/uploads", express.static(uploadsDir));
app.use("/uploads/leaders", express.static(leadersUploadDir));
app.use("/uploads/battles", express.static(battlesUploadDir));

// Logging middleware
app.use((req, res, next) => {
  console.log(`📁 ${req.method} ${req.url}`);
  next();
});

// CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ============================================
// ROUTES - USING YOUR ACTUAL CONTROLLERS
// ============================================
console.log("Setting up routes...");

// Health check (simple, no DB dependency)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    service: "leaders-service",
    port: PORT,
    environment: process.env.NODE_ENV || "development"
  });
});

// Mount your actual routes
app.use("/api/v1/leaders", leaderRoutes);
app.use("/api/v1/battles", battleRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    service: "Leaders Service",
    version: "2.0.0",
    status: "running",
    endpoints: [
      "/health",
      "/api/v1/leaders",
      "/api/v1/leaders/manifestos/personalized",
      "/api/v1/leaders/popular",
      "/api/v1/battles"
    ]
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// ============================================
// START SERVER
// ============================================
async function startServer() {
  try {
    // Initialize database
    console.log("🔄 Initializing database...");
    await initDB();
    console.log("✅ Database initialized");

    // Start HTTP server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log("=".repeat(50));
      console.log(`✅✅✅ Leaders Service IS RUNNING! ✅✅✅`);
      console.log("=".repeat(50));
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌐 Health: http://localhost:${PORT}/health`);
      console.log(`📊 Leaders: http://localhost:${PORT}/api/v1/leaders`);
      console.log(`📜 Manifestos: http://localhost:${PORT}/api/v1/leaders/manifestos/personalized`);
      console.log(`⚔️ Battles: http://localhost:${PORT}/api/v1/battles`);
      console.log("=".repeat(50));
    });

    server.on('error', (err) => {
      console.error("❌ Server error:", err.message);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use!`);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

startServer();