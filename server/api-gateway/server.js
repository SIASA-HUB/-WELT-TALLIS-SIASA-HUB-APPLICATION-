require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const proxy = require('express-http-proxy');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const app = express();

//configs 
const PORT = process.env.PORT || 5004;
const HOST = process.env.HOST || '0.0.0.0';

//redis client
const redisClient = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

//logger
const Logger = {
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
  warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || ''),
};
//middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

//request logs 
  Logger.info('Incoming Request', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });
  next();
  
///rate limitetrs

// Global API limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

// Sensitive endpoints limiter
const sensitiveLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    Logger.warn('Sensitive endpoint rate limit hit', { ip: req.ip });
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Try again later.',
    });
  },
});

app.use(apiLimiter);
//  routes /
app.get('/leaders', (req, res) => {
  res.json({ success: true, message: 'Leaders endpoint' });
});

app.post('/leaders/vote', sensitiveLimiter, (req, res) => {
  res.json({ success: true, message: 'Vote submitted' });
});





app.use(
  "/v1/profile",
  // validateToken,
  proxy(process.env.PROFILE_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);

//setting up proxy for our media service
app.use(
  "/v1/media",
  // validateToken,
  proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from media service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
    parseReqBody: false,
  })
);

//setting up proxy for our search service
app.use(
  "/v1/search",
  // validateToken,
  proxy(process.env.SEARCH_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Search service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);

app.use(errorHandler);


//heath   cehcks  
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

//global  erro hanndler
app.use((err, req, res, next) => {
  Logger.error('GLOBAL ERROR HANDLER', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

//proces  saftey*/
process.on('uncaughtException', (error) => {
  Logger.error('UNCAUGHT EXCEPTION', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  Logger.error('UNHANDLED PROMISE REJECTION', reason);
  process.exit(1);
});

//start  server
const server = app.listen(PORT, HOST, () => {
  Logger.info('Server running', { host: HOST, port: PORT });
});

///shutdown 
const shutdown = () => {
  Logger.info('Shutdown signal received');
  server.close(() => {
    redisClient.quit();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
