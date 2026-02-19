const   dotenv   =  require('dotenv');
dotenv.config();
const express = require('express');
const helmet = require('helmet');   
const cors = require('cors');

const Logger = require('./src/utils/logger/logger');
const { initDB, closeDB } = require('./src/configurations/db');
const hashRoutes  = require('./src/routes/hashRoutes');

const app = express();

// Error handling for uncaught exceptions & unhandled rejections
process.on('uncaughtException', (error) => {
  Logger.error('UNCAUGHT EXCEPTION', { message: error.message, stack: error.stack });
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  Logger.error('UNHANDLED PROMISE REJECTION', { reason: JSON.stringify(reason), stack: reason?.stack });
  setTimeout(() => process.exit(1), 1000);
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  Logger.info('Incoming Request', { method: req.method, path: req.originalUrl, ip: req.ip });
  next();
});

// Routes
app.use('/api/v1/reaction', hashRoutes);

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() }));

// 404 handler
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});



const { startAllConsumers } = require('./src/controller/rabbitmq/consumers/index');





// Global error handler
app.use((err, req, res, next) => {
  Logger.error('GLOBAL ERROR HANDLER', { message: err.message, stack: err.stack, path: req.originalUrl });
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error', timestamp: Date.now() });
});

// Server & Database Startup
const PORT = process.env.PORT || 9001;
const HOST = process.env.HOST || '0.0.0.0';

(async () => {

    try {
      
       await startAllConsumers();

    } catch (error) {
      
    }
    
  try {
    Logger.info('Starting database');
    await initDB();

    const server = app.listen(PORT, HOST, () => {
        console.log({
            port:  PORT
        })
      Logger.info('Server  is  up  and  running', { host: HOST, port: PORT });
    });

    const shutdown = async () => {
      Logger.info('Shutdown signal received. Closing server...');
      await closeDB();
      server.close(() => { Logger.info('Server closed.'); process.exit(0); });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    Logger.error('Failed to start application', { message: error.message, stack: error.stack });
    process.exit(1);
  }
})();
