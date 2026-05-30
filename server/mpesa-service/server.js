import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import db from './src/config/db.js';
import mpesaRoutes from './src/routes/mpesa.routes.js';

// Error handlers AFTER imports (ESM requirement)
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 UNHANDLED REJECTION:', reason?.message || reason);
  console.error(reason?.stack || reason);
  process.exit(1);
});

const app  = express();
const PORT = process.env.PORT || 8011;

console.log('[Startup] server.js loaded');
console.log('[Startup] PORT =', PORT);
console.log('[Startup] DB_HOST =', process.env.DB_HOST);
console.log('[Startup] REDIS_HOST =', process.env.REDIS_HOST);
console.log('[Startup] MPESA_ENV =', process.env.MPESA_ENVIRONMENT);

(async () => {
  try {
    await db.migrate.latest({ directory: './src/migrations' });
    console.log('[DB] Migrations up to date');
  } catch (err) {
    console.warn('[DB] Migration warning (non-fatal):', err.message);
  }
})();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/v1/mpesa', mpesaRoutes);

app.get('/health', (_, res) =>
  res.json({ status: 'UP', service: 'mpesa-service', timestamp: new Date().toISOString() })
);

app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 M-Pesa Service running at http://localhost:${PORT}`);
  console.log(`   Health  → http://localhost:${PORT}/health`);
  console.log(`   STK     → POST http://localhost:${PORT}/api/v1/mpesa/stkpush`);
  console.log(`   Callback→ POST http://localhost:${PORT}/api/v1/mpesa/callback`);
  console.log(`   Env     → ${process.env.MPESA_ENVIRONMENT || 'sandbox'}`);
});

process.on('SIGINT',  () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));