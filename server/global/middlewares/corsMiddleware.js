const cors = require("cors");

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:8080",
      "http://localhost:5174",
      "http://localhost:8009", // Gateway
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://siasahub.co.ke"
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-CSRF-Token",
  ],
  exposedHeaders: ["set-cookie"],
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
