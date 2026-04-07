const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://tour-bestsellers-conditional-tunnel.trycloudflare.com",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    // Add your production domains here
    "https://yourdomain.com",
    "https://www.yourdomain.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
  ],
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

module.exports = { corsOptions };
