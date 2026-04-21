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

/**
 * FIXED STATIC SERVING logic:
 * This handles /uploads/leaders (direct) AND /api/v1/uploads/leaders (via Gateway)
 */
app.use(
  ['/api/v1/uploads/leaders', '/uploads/leaders', '/uploads'],
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  })
);

// Log static file requests for debugging
app.use(['/api/v1/uploads', '/uploads'], (req, res, next) => {
  console.log(`📁 Static file request: ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================
// SOCKET.IO CONFIGURATION
// ============================================

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

battleController.setIo(io);
const connectedClients = new Map();

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);
  connectedClients.set(socket.id, socket);

  socket.on("join-battle", (battleId) => {
    socket.join(`battle_${battleId}`);
    console.log(`📡 Client ${socket.id} joined battle: ${battleId}`);
    socket.emit("joined-battle", { battleId, success: true });
  });

  socket.on("leave-battle", (battleId) => {
    socket.leave(`battle_${battleId}`);
    console.log(`Client ${socket.id} left battle: ${battleId}`);
  });

  socket.on("battle-vote", (data) => {
    const { battleId, candidateId, deviceId, votesLeft, votesRight } = data;
    io.to(`battle_${battleId}`).emit("vote-update", {
      battleId,
      votesLeft,
      votesRight,
      candidateId,
      deviceId,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("battle-reaction", (data) => {
    const { battleId, reaction, deviceId, reactionCount } = data;
    io.to(`battle_${battleId}`).emit("reaction-update", {
      battleId,
      reaction,
      reactionCount,
      deviceId,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("battle-comment", (data) => {
    const { battleId, comment, deviceId, userName } = data;
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

  socket.on("battle-created", (data) => {
    io.emit("new-battle", data);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Client disconnected:", socket.id);
    connectedClients.delete(socket.id);
  });
});

// ============================================
// PROCESS ERROR HANDLERS
// ============================================

process.on("uncaughtException", (error) => {
  Logger.error("UNCAUGHT EXCEPTION", { message: error.message, stack: error.stack });
  setTimeout(() => process.exit(1), 1000);
});

process.on("unhandledRejection", (reason) => {
  Logger.error("UNHANDLED PROMISE REJECTION", { stack: reason?.stack || reason });
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
        "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net", "*"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/uploads')) {
    Logger.info("Incoming Request", { method: req.method, path: req.originalUrl, ip: req.ip });
  }
  next();
});

// ============================================
// ROUTES
// ============================================

app.use("/api/v1/leaders", leaderRoutes);
app.use("/api/v1/battles", battleRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    sockets: connectedClients.size,
    uploadsPath: uploadsDir
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  Logger.error("GLOBAL ERROR HANDLER", { message: err.message, stack: err.stack, path: req.originalUrl });
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
  console.log("🔄 Starting database migrations...");
  let migrationsCompleted = false;
  try {
    try {
      await db.migrate.forceFreeMigrationsLock();
    } catch (e) { }

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const [batchNo, log] = await db.migrate.latest();
        console.log(`✅ Migrations completed! Batch: ${batchNo}`);
        migrationsCompleted = true;
        break;
      } catch (err) {
        if (err.message.includes('locked')) {
          await db.raw('UPDATE knex_migrations_lock SET is_locked = 0');
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  }
  return migrationsCompleted;
}

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 8006;
const HOST = process.env.HOST || "0.0.0.0";

(async () => {
  let migrationsRan = false;
  try {
    migrationsRan = await runMigrations();
    await initDB();

    server.listen(PORT, HOST, () => {
      console.log(`✅ Leaders Service running on ${HOST}:${PORT}`);
      Logger.info("Server started", { port: PORT, migrationsRan });
    });

    const shutdown = () => {
      server.close(async () => {
        await db.destroy();
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
})();