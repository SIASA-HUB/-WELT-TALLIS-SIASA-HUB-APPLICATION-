require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const Logger = require('./src/utils/logger/logger');
const { initDB, closeDB } = require('./src/configurations/db');
const searchRoutes = require('./src/routes/searchRoutes');


const app = express();

// ==========================
// Process-level error handling
// ==========================
process.on('uncaughtException', (error) => {
  Logger.error('UNCAUGHT EXCEPTION', { message: error.message, stack: error.stack });
  console.error('UNCAUGHT EXCEPTION', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  Logger.error('UNHANDLED PROMISE REJECTION', { reason: JSON.stringify(reason), stack: reason?.stack });
  console.error('UNHANDLED PROMISE REJECTION', reason);
  setTimeout(() => process.exit(1), 1000);
});

// ==========================
// Middlewares
// ==========================
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  Logger.info('Incoming Request', { method: req.method, path: req.originalUrl, ip: req.ip });
  next();
});

// ==========================
// Routes
// ==========================
app.use('/api/v1/searches', searchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', timestamp: Date.now() });
});

// Global error handler
app.use((err, req, res, next) => {
  Logger.error('GLOBAL ERROR', { message: err.message, stack: err.stack, path: req.originalUrl });
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error', timestamp: Date.now() });
});

// ==========================
// Server & DB startup
// ==========================
const PORT = process.env.PORT || 9002;
const HOST = process.env.HOST || '0.0.0.0';

(async () => {
  try {
    console.log('initializing  datbase  ')
    Logger.info('Initializing database...');
    await initDB();
    console.log('✅ Database connected');

    const server = app.listen(PORT, HOST, () => {
      Logger.info('Server running', { host: HOST, port: PORT });
      console.log(`✅ Server running at http://${HOST}:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      Logger.info('Shutdown signal received. Closing server...');
      await closeDB();
      server.close(() => {
        Logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    Logger.error('Startup failed', { message: err.message, stack: err.stack });
    console.error('Startup failed', err);
    process.exit(1);
  }
})();
