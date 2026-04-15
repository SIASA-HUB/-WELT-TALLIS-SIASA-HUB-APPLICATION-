




const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:8080',
  'http://localhost:3001',
  'https://siasahub.co.ke'
];

const corsOptions = {

  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    if (!allowedOrigins.includes(normalizedOrigin)) {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error(`CORS origin ${origin} not allowed`), false);
    }

    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = { allowedOrigins, corsOptions };
