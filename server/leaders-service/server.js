require("dotenv").config();
// Forced restart to pick up global secret changes

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
const battleRoutes = require("./src/routes/battle");
const battleController = require("./src/controllers/BattleController");
const corsMiddleware = require("../global/middlewares/corsMiddleware");

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

// CORS middleware
app.use(corsMiddleware);

// ============================================
// SOCKET.IO CONFIGURATION
// ============================================

const io = socketIo(server, {
  cors: {
    origin: "*", // Socket.IO CORS is separate, but we can allow all in dev gateway environment
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
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        "style-src": ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
      },
    },
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
      status: "global_middleware_active",
    },
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
// DATABASE MIGRATIONS - IMPROVED VERSION
// ============================================

const knexConfig = require("./knexfile");
const db = knex(knexConfig[process.env.NODE_ENV || "development"]);

async function runMigrations() {
  console.log("🔄 Starting database migrations...");

  // Set a flag to track if migrations completed
  let migrationsCompleted = false;

  try {
    // Step 1: Try to force unlock any existing locks
    console.log("📝 Checking for existing migration locks...");
    try {
      await db.migrate.forceFreeMigrationsLock();
      console.log("✓ Migration lock check completed");
    } catch (unlockError) {
      console.log("⚠️ Could not force unlock (may not be needed):", unlockError.message);
    }

    // Step 2: Run migrations with retry logic
    console.log("📝 Running migrations...");

    // Try up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const [batchNo, log] = await db.migrate.latest();
        console.log(`✅ Migrations completed successfully! Batch: ${batchNo}`);
        if (log && log.length > 0) {
          console.log(`📝 Migrations run: ${log.join(', ')}`);
        } else {
          console.log("📝 No new migrations to run");
        }
        migrationsCompleted = true;
        break;
      } catch (migrationError) {
        console.log(`⚠️ Migration attempt ${attempt} failed:`, migrationError.message);

        if (attempt === 3) {
          throw migrationError;
        }

        // If locked, try to unlock
        if (migrationError.message && migrationError.message.includes('Migration table is already locked')) {
          console.log("🔓 Migration table is locked, attempting to unlock...");
          try {
            await db.raw('UPDATE knex_migrations_lock SET is_locked = 0');
            console.log("✓ Manual unlock attempted");
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (unlockErr) {
            console.log("⚠️ Could not unlock:", unlockErr.message);
          }
        } else {
          // For other errors, wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    if (!migrationsCompleted) {
      throw new Error("Migrations failed after multiple attempts");
    }

  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("Stack trace:", error.stack);

    // Don't throw - we want the app to continue even if migrations fail
    // But log it clearly
    console.error("⚠️ WARNING: Application will continue but database schema may be incomplete!");
  }

  console.log("🏁 Migration process finished");
  return migrationsCompleted;
}

// ============================================
// SERVER STARTUP WITH REDIS ERROR HANDLING
// ============================================

const PORT = process.env.PORT || 8006;
const HOST = process.env.HOST || "0.0.0.0";

(async () => {
  let migrationsRan = false;

  try {
    // Run migrations with a timeout to prevent hanging startup
    console.log("📋 Running database migrations before starting services...");
    try {
      const migrationTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Migration timeout")), 30000)
      );
      migrationsRan = await Promise.race([runMigrations(), migrationTimeout]);
    } catch (migError) {
      console.error("⚠️ Migration process failed or timed out:", migError.message);
    }

    // Now initialize database with a timeout
    console.log("📡 Initializing database connections...");
    try {
      const dbTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB initialization timeout")), 15000)
      );
      await Promise.race([initDB(), dbTimeout]);
      console.log("✅ Database initialized");
    } catch (dbInitError) {
      console.error("⚠️ Database initialization warning:", dbInitError.message);
      console.log("⚠️ Continuing startup despite issues...");
    }

    // Start the server regardless of Redis
    console.log("🎯 Starting server...");
    server.listen(PORT, HOST, () => {
      console.log(`✅ Server is running on ${HOST}:${PORT}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
      console.log(`🔌 WebSocket ready`);

      if (!migrationsRan) {
        console.warn("⚠️ WARNING: Migrations did not run successfully!");
        console.warn("⚠️ Database schema may be out of date!");
      }

      Logger.info("Server running with Socket.IO", {
        host: HOST,
        port: PORT,
        action: "server_started",
        migrationsRan: migrationsRan
      });
    });

    server.on('error', (error) => {
      console.error("❌ Server error:", error);
      Logger.error("Server error:", error);
    });

    // Shutdown handler
    const shutdown = () => {
      console.log("🛑 Shutting down gracefully...");
      Logger.info("Shutdown signal received. Closing server...");

      server.close(async () => {
        console.log("✅ Server closed");
        try {
          await db.destroy();
          console.log("✅ Database connection closed");
        } catch (dbError) {
          console.error("⚠️ Error closing database:", dbError.message);
        }
        process.exit(0);
      });

      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error("⚠️ Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (error) {
    console.error("❌ Failed to start application:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    Logger.error("Failed to start application", {
      message: error.message,
      stack: error.stack,
      action: "startup_failed",
    });

    // Even if there's an error, try to close database connection
    try {
      await db.destroy();
    } catch (dbError) {
      // Ignore
    }

    process.exit(1);
  }
})();