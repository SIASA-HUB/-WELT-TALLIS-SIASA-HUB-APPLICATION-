// shared/db/index.js
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const Logger = require("../logger/logger");

dotenv.config();

// Database configuration
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "root";
const DB_NAME = process.env.DB_NAME || "ballot";
const DB_POOL_SIZE = parseInt(process.env.DB_POOL_SIZE) || 50;
const DB_QUEUE_LIMIT = parseInt(process.env.DB_QUEUE_LIMIT) || 100;
const DB_CONNECTION_TIMEOUT =
  parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000;
const DB_IDLE_TIMEOUT = parseInt(process.env.DB_IDLE_TIMEOUT) || 60000;

// Create connection pool with auth plugin fix
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: DB_POOL_SIZE,
  queueLimit: DB_QUEUE_LIMIT,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: DB_CONNECTION_TIMEOUT,
  idleTimeout: DB_IDLE_TIMEOUT,
  dateStrings: true,
  // FIX: Handle GSSAPI authentication plugin
  authPlugins: {
    // Skip GSSAPI authentication
    auth_gssapi_client: () => () => {
      return Buffer.from([]);
    },
    // Handle caching_sha2_password
    caching_sha2_password: (pluginData) => {
      return Buffer.from([]);
    },
  },
  // Alternative: Use native password authentication
  authSwitchHandler: (data, cb) => {
    if (data.pluginName === "auth_gssapi_client") {
      // Skip GSSAPI and continue with default auth
      cb(null, Buffer.from([]));
    } else {
      cb(null, null);
    }
  },
  // SSL for production
  ...(process.env.DB_SSL === "true" && {
    ssl: {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
    },
  }),
});

// ============================================
// SAFE QUERY FUNCTIONS
// ============================================

// Safe query (multiple rows)
const safeQuery = async (sql, params = []) => {
  const startTime = Date.now();
  try {
    const [rows] = await pool.execute(sql, params);
    const duration = Date.now() - startTime;

    // Log slow queries (> 1 second)
    if (duration > 1000) {
      Logger.warn(`Slow query (${duration}ms): ${sql.substring(0, 200)}`);
    }

    return rows;
  } catch (error) {
    Logger.error("Query error:", {
      sql: sql.substring(0, 500),
      params,
      error: error.message,
      code: error.code,
    });
    throw error;
  }
};

// Safe query (single row)
const safeQueryOne = async (sql, params = []) => {
  const rows = await safeQuery(sql, params);
  return rows[0] || null;
};

// Get raw connection for transactions
const getConnection = async () => {
  return await pool.getConnection();
};

// ============================================
// TRANSACTION SUPPORT
// ============================================

// Execute a transaction with rollback on error
const transaction = async (callback) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    Logger.debug("Transaction started");

    // Create wrapper functions for the connection
    const query = async (sql, params = []) => {
      const [rows] = await connection.execute(sql, params);
      return rows;
    };

    const queryOne = async (sql, params = []) => {
      const rows = await query(sql, params);
      return rows[0] || null;
    };

    // Execute the callback with the transaction connection
    const result = await callback({ query, queryOne, connection });

    await connection.commit();
    Logger.debug("Transaction committed");
    return result;
  } catch (error) {
    await connection.rollback();
    Logger.error("Transaction rolled back:", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    connection.release();
  }
};

// ============================================
// HEALTH CHECK
// ============================================
const healthCheck = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { status: "healthy", message: "Database connection successful" };
  } catch (error) {
    Logger.error("Database health check failed:", error);
    return { status: "unhealthy", message: error.message };
  }
};

// ============================================
// CONNECTION POOL MONITORING
// ============================================
const getPoolStatus = () => {
  return {
    totalConnections: pool.pool._allConnections?.length || 0,
    freeConnections: pool.pool._freeConnections?.length || 0,
    waitingClients: pool.pool._connectionQueue?.length || 0,
  };
};

// ============================================
// INITIALIZE DATABASE
// ============================================
let isInitialized = false;

const initDB = async () => {
  if (isInitialized) return;

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    Logger.info(`✅ Connected to database: ${DB_NAME}@${DB_HOST}:${DB_PORT}`);
    isInitialized = true;
  } catch (error) {
    Logger.error(`❌ Failed to connect to database:`, {
      error: error.message,
      code: error.code,
    });
    throw error;
  }
};

// ============================================
// CLOSE DATABASE CONNECTIONS
// ============================================
const closeDB = async () => {
  try {
    await pool.end();
    Logger.info("✅ Database pool closed");
    isInitialized = false;
  } catch (error) {
    Logger.error("Error closing database pool:", error);
  }
};

// NOTE: Do NOT call process.exit() from a shared library module.
// Each service's server.js should handle its own graceful shutdown.
// The closeDB function is exported for services to call explicitly.

// ============================================
// EXPORTS
// ============================================
module.exports = {
  pool,
  initDB,
  safeQuery,
  safeQueryOne,
  getConnection,
  transaction,
  healthCheck,
  getPoolStatus,
  closeDB,
};
