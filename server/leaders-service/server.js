require("dotenv").config();
console.log("=".repeat(50));
console.log("DEBUG: server.js execution started");
console.log("=".repeat(50));

const express = require("express");
console.log("✓ Express loaded");

const path = require("path");
console.log("✓ Path loaded");

const fs = require("fs");
console.log("✓ FS loaded");

const app = express();
console.log("✓ Express app created");

const PORT = process.env.PORT || 8006;
console.log(`✓ PORT = ${PORT}`);

// ============================================
// SIMPLE LOGGER (no Redis dependency)
// ============================================
const Logger = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[ERROR] ${msg}`, data || '')
};
console.log("✓ Logger created (no Redis)");

// ============================================
// UPLOADS DIRECTORY
// ============================================
const uploadsDir = path.join(__dirname, "uploads");
console.log(`✓ Uploads dir: ${uploadsDir}`);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

const leadersUploadDir = path.join(uploadsDir, "leaders");
if (!fs.existsSync(leadersUploadDir)) {
  fs.mkdirSync(leadersUploadDir, { recursive: true });
  console.log("✅ Created leaders uploads directory");
}

const battlesUploadDir = path.join(uploadsDir, "battles");
if (!fs.existsSync(battlesUploadDir)) {
  fs.mkdirSync(battlesUploadDir, { recursive: true });
  console.log("✅ Created battles uploads directory");
}

// ============================================
// MIDDLEWARE
// ============================================
console.log("Setting up middleware...");
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
console.log("✓ Body parsers added");

// Static files
app.use("/uploads", express.static(uploadsDir));
app.use("/uploads/leaders", express.static(leadersUploadDir));
app.use("/uploads/battles", express.static(battlesUploadDir));
console.log("✓ Static file serving added");

// Logging middleware
app.use((req, res, next) => {
  console.log(`📁 ${req.method} ${req.url}`);
  next();
});
console.log("✓ Logging middleware added");

// ============================================
// ROUTES
// ============================================
console.log("Setting up routes...");

// Health check
app.get("/health", (req, res) => {
  console.log("Health check called");
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    service: "leaders-service",
    port: PORT,
    environment: process.env.NODE_ENV || "development"
  });
});
console.log("✓ Health route added");

// Test route
app.get("/api/v1/test", (req, res) => {
  res.json({
    success: true,
    message: "Leaders service is working!",
    timestamp: new Date().toISOString()
  });
});
console.log("✓ Test route added");

// Leaders route (placeholder)
app.get("/api/v1/leaders", (req, res) => {
  res.json({
    success: true,
    message: "Leaders endpoint working",
    data: [],
    count: 0
  });
});
console.log("✓ Leaders route added");

// Battles route (placeholder)
app.get("/api/v1/battles", (req, res) => {
  res.json({
    success: true,
    message: "Battles endpoint working",
    data: [],
    count: 0
  });
});
console.log("✓ Battles route added");

// Root route
app.get("/", (req, res) => {
  res.json({
    service: "Leaders Service",
    version: "1.0.0",
    endpoints: ["/health", "/api/v1/leaders", "/api/v1/battles", "/api/v1/test"],
    status: "running"
  });
});
console.log("✓ Root route added");

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});
console.log("✓ 404 handler added");

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});
console.log("✓ Error handler added");

// ============================================
// START SERVER
// ============================================
console.log("=".repeat(50));
console.log(`Attempting to start server on port ${PORT}...`);
console.log("=".repeat(50));

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log("=".repeat(50));
  console.log(`✅✅✅ Leaders Service IS RUNNING! ✅✅✅`);
  console.log("=".repeat(50));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Leaders: http://localhost:${PORT}/api/v1/leaders`);
  console.log(`⚔️ Battles: http://localhost:${PORT}/api/v1/battles`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/v1/test`);
  console.log("=".repeat(50));
});

server.on('error', (err) => {
  console.error("❌❌❌ SERVER ERROR ❌❌❌");
  console.error(`Code: ${err.code}`);
  console.error(`Message: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use!`);
    console.error(`Try: netstat -ano | findstr :${PORT}`);
  }
  process.exit(1);
});

console.log("Server listen called, waiting for connections...");