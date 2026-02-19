const   dotenv   =  require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const proxy = require('express-http-proxy');
const rateLimit = require('express-rate-limit');
const    { RedisStore } = require('rate-limit-redis');

const redis = require('./src/utils/redis/redis');
const app = express();

//   configuration
const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

//Logger
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

//request  logger 
app.use((req, res, next) => {
  Logger.info('Incoming Request', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });
  next();
});

//rate  limitters 

const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
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
    sendCommand: (...args) => redis.call(...args),
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

//proxy  options
const proxyOptions = {
  proxyReqPathResolver: (req) => req.originalUrl,
};

//profile  service
app.use(
  '/api/v1/media',
  proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts) => {
      proxyReqOpts.headers['Content-Type'] = 'application/json';
      return proxyReqOpts;
    },
  })
);


//health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

//global  erro handler 
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

//process   saftety 
process.on('uncaughtException', (error) => {
  Logger.error('UNCAUGHT EXCEPTION', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  Logger.error('UNHANDLED PROMISE REJECTION', reason);
  process.exit(1);
});

//start    server
const server = app.listen(PORT, HOST, () => {
  console.log({ message: "Server running"  , port:   PORT})
  Logger.info('Server running', { host: HOST, port: PORT });
});

//shutdown
const shutdown = async () => {
  Logger.info('Shutdown signal received');
  server.close(async () => {
    await redis.quit();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
