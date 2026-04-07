const allowedOrigins = [
  "http://localhost:5174",
  "https://icons-stan-transactions-percentage.trycloudflare.com/",
  "https://protective-stanley-applicant-belly.trycloudflare.com",
  "https://stomach-profits-providers-veteran.trycloudflare.com",
  "http://localhost:3001",
  "https://reseller-add-banana-api.trycloudflare.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (!allowedOrigins.includes(normalizedOrigin)) {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error(`CORS origin ${origin} not allowed`), false);
    }

    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = { allowedOrigins, corsOptions };
