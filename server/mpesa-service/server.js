import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import db from './src/config/db.js';
import mpesaRoutes from './src/routes/mpesa.routes.js';
import { recordTransaction } from './src/services/transactionService.js';

dotenv.config();

// Database Initialization
const initDB = async () => {
  try {
    console.log('📦 [M-Pesa Service] Checking database migrations...');
    await db.migrate.latest({
      directory: './src/migrations'
    });
    console.log('✅ [M-Pesa Service] Database ready.');
  } catch (error) {
    console.warn('⚠️ [M-Pesa Service] Migration failed (non-fatal):', error.message);
  }
};

initDB();

const app = express();
const PORT = process.env.PORT || 8011;

// Process error handlers
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error.message, error.stack);
  // Optional: record to a persistent log
});

process.on('unhandledRejection', (reason) => {
  console.error('🌀 UNHANDLED PROMISE REJECTION:', reason?.message || reason);
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/mpesa', mpesaRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'mpesa-service',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handling
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 M-Pesa Service running on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = () => {
  console.log('Stopping M-Pesa Service...');
  server.close(() => {
    console.log('M-Pesa Service stopped.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
