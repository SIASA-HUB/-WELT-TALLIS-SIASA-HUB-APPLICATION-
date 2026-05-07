const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.SOCKET_PORT || 8010;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const io = new Server(server, {
  cors: {
    origin: "*", // Controlled by API Gateway in production
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

// Redis Adapter for Scalability
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log("🚀 Socket.IO Redis Adapter connected");
}).catch(err => {
  console.error("❌ Redis connection error:", err);
});

io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id);

  // Join a specific battle room
  socket.on("join-battle", (battleId) => {
    socket.join(`battle_${battleId}`);
    console.log(`📡 Socket ${socket.id} joined battle_${battleId}`);
  });

  // Handle battle-wide broadcasts (e.g., new battles)
  socket.on("battle-broadcast", (data) => {
    if (data.type === "new-battle") {
      io.emit("new-battle", data.battle);
    }
  });

  // Handle voting updates (usually broadcasted from the Leaders Service)
  socket.on("vote-broadcast", (data) => {
    // data: { battleId, candidateId, votesLeft, votesRight, county }
    io.to(`battle_${data.battleId}`).emit("vote-update", data);
  });

  // Handle gift updates
  socket.on("gift-broadcast", (data) => {
    // data: { battleId, giftValue, giftTotal, userName }
    io.to(`battle_${data.battleId}`).emit("gift-update", data);
  });

  // Handle reaction updates
  socket.on("reaction-broadcast", (data) => {
    // data: { battleId, reaction, reactionCount }
    io.to(`battle_${data.battleId}`).emit("reaction-update", data);
  });

  // Handle comment updates
  socket.on("comment-broadcast", (data) => {
    // data: { battleId, comment: { text, user_name, created_at } }
    io.to(`battle_${data.battleId}`).emit("comment-update", data);
  });

  socket.on("disconnect", () => {
    console.log("👋 User disconnected:", socket.id);
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "socketio-service" });
});

server.listen(PORT, () => {
  console.log(`⚡ Socket.IO Service running on port ${PORT}`);
});
