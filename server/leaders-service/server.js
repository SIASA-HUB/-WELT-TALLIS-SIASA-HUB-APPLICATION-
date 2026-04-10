require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const knex = require("knex");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const fs = require("fs");

const Logger = require("./src/utils/logger/logger");
const { initDB } = require("./src/configurations/db");
const leaderRoutes = require("./src/routes/Leader");
const battleRoutes = require("./src/routes/Battle");
const battleController = require("./src/controllers/BattleController");
const { connectRabbitMQ } = require("./src/Qeues/Rabbit");

const app = express();
const server = http.createServer(app);

// ============================================
// UPLOADS DIRECTORY - CREATE AND SERVE STATIC FILES
// ============================================

// Ensure uploads directory exists inside leaders-service
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory:", uploadsDir);
}

// Create leaders subdirectory inside uploads
const leadersUploadDir = path.join(uploadsDir, "leaders");
if (!fs.existsSync(leadersUploadDir)) {
  fs.mkdirSync(leadersUploadDir, { recursive: true });
  console.log("✅ Created leaders uploads directory:", leadersUploadDir);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Log static file requests for debugging
app.use('/uploads', (req, res, next) => {
  console.log(`📁 Static file request: ${req.url}`);
  next();
});

// ============================================
// CORS CONFIGURATION
// ============================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://tour-bestsellers-conditional-tunnel.trycloudflare.com",
  "https://tour-bestsellers-conditional-tunnel.trycloudflare.com",
  "https://dem-cartridge-basketball-intervention.trycloudflare.com",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://pin-frequently-rapids-refuse.trycloudflare.com",
];

// CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      console.log("CORS allowed: no origin");
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log("CORS allowed for:", origin);
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

// CORS middleware
app.use(cors(corsOptions));

// ============================================
// SOCKET.IO CONFIGURATION
// ============================================

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// Set Socket.IO instance in battle controller
battleController.setIo(io);

// Store connected clients for debugging
const connectedClients = new Map();

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);
  console.log("📡 Socket handshake details:", {
    id: socket.id,
    address: socket.handshake.address,
  });

  connectedClients.set(socket.id, socket);

  // Join a battle room
  socket.on("join-battle", (battleId) => {
    socket.join(`battle_${battleId}`);
    console.log(`📡 Client ${socket.id} joined battle: ${battleId}`);
    socket.emit("joined-battle", { battleId, success: true });
  });

  // Leave a battle room
  socket.on("leave-battle", (battleId) => {
    socket.leave(`battle_${battleId}`);
    console.log(`Client ${socket.id} left battle: ${battleId}`);
  });

  // Handle real-time vote from client
  socket.on("battle-vote", (data) => {
    const { battleId, candidateId, deviceId, votesLeft, votesRight } = data;
    console.log("Real-time vote received:", {
      battleId,
      candidateId,
      deviceId,
    });
    io.to(`battle_${battleId}`).emit("vote-update", {
      battleId,
      votesLeft,
      votesRight,
      candidateId,
      deviceId,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle real-time reaction from client
  socket.on("battle-reaction", (data) => {
    const { battleId, reaction, deviceId, reactionCount } = data;
    console.log("Real-time reaction received:", {
      battleId,
      reaction,
      deviceId,
    });
    io.to(`battle_${battleId}`).emit("reaction-update", {
      battleId,
      reaction,
      reactionCount,
      deviceId,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle real-time comment from client
  socket.on("battle-comment", (data) => {
    const { battleId, comment, deviceId, userName } = data;
    console.log("💬 Real-time comment received:", {
      battleId,
      comment,
      deviceId,
    });
    io.to(`battle_${battleId}`).emit("comment-update", {
      battleId,
      comment: {
        id: `cmt_${Date.now()}`,
        user: userName || "Anonymous",
        text: comment,
        created_at: new Date().toISOString(),
      },
      deviceId,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle real-time battle creation from client
  socket.on("battle-created", (data) => {
    console.log("🎮 New battle created:", data.battleId);
    io.emit("new-battle", data);
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log("🔌 Client disconnected:", socket.id, "Reason:", reason);
    connectedClients.delete(socket.id);
  });
});

// ============================================
// PROCESS ERROR HANDLERS
// ============================================

process.on("uncaughtException", (error) => {
  Logger.error("UNCAUGHT EXCEPTION", {
    message: error.message,
    stack: error.stack,
  });
  console.error("UNCAUGHT EXCEPTION:", error);

  setTimeout(() => process.exit(1), 1000);
});

process.on("unhandledRejection", (reason) => {
  Logger.error("UNHANDLED PROMISE REJECTION", {
    stack: reason?.stack || reason,
  });
  console.error("UNHANDLED PROMISE REJECTION:", reason);
});

// ============================================
// MIDDLEWARES
// ============================================

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  Logger.info("Incoming Request", {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });
  next();
});

// ============================================
// ROUTES
// ============================================

app.use("/api/v1/leaders", leaderRoutes);
app.use("/api/v1/battles", battleRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    sockets: connectedClients.size,
    uploadsPath: uploadsDir,
    cors: {
      allowedOrigins,
      currentOrigin: req.headers.origin,
    },
  });
});

// CORS test endpoint
app.get("/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    method: req.method,
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
  console.error("GLOBAL ERROR:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    timestamp: Date.now(),
  });
});

// ============================================
// DATABASE MIGRATIONS
// ============================================

const knexConfig = require("./knexfile");
const db = knex(knexConfig[process.env.NODE_ENV || "development"]);

async function runMigrations() {
  try {
    await db.migrate.latest();
    console.log("✅ Migrations up to date");
  } catch (error) {
    console.error("Migration error:", error);
  }
}

runMigrations();

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 8002;
const HOST = process.env.HOST || "0.0.0.0";

(async () => {
  try {
    console.log({
      port: PORT,
      host: HOST,
      nodeEnv: process.env.NODE_ENV,
      uploadsPath: uploadsDir,
      allowedOrigins,
    });

    Logger.info("Starting database", { action: "start_database" });
    await initDB();

    server.listen(PORT, HOST, () => {
      Logger.info("Server running with Socket.IO", {
        host: HOST,
        port: PORT,
        action: "server_started",
      });
      console.log(`\n🚀 Server running at http://${HOST}:${PORT}`);
      console.log(`🔌 Socket.IO server is ready`);
      console.log(`📁 Serving static files from: ${uploadsDir}`);
      console.log(`🔗 Image URL example: http://${HOST}:${PORT}/uploads/leaders/LDR_xxx/image.webp`);
      console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
      console.log(`🔧 CORS Test: http://${HOST}:${PORT}/cors-test`);
      console.log(`✅ Allowed origins:`, allowedOrigins);
      console.log(`\n📡 Ready to accept connections\n`);
    });

    // Shutdown handler
    const shutdown = () => {
      Logger.info("Shutdown signal received. Closing server...");
      console.log("🛑 Shutting down gracefully...");
      server.close(async () => {
        Logger.info("Server closed.");
        await db.destroy();
        console.log("✅ Database connection closed");
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
    console.error("❌ Failed to start:", error);
    process.exit(1);
  }
})();