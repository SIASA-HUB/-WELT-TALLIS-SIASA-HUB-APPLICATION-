const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const asyncHandler = require("express-async-handler");
const Logger = require("../utils/logger/logger");

dotenv.config();

// env
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "root";
const DB_NAME = process.env.DB_NAME || "ballot";

// connection pool
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 100,
  dateStrings: true,
});

// Safe query (multiple rows)
const safeQuery = asyncHandler(async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
});

// Safe query (single row)
const safeQueryOne = asyncHandler(async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
});

// Get raw connection (transactions)
async function getConnection() {
  return pool.getConnection();
}

// Transaction function - ADD THIS
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Create a wrapper for connection queries that matches the same interface as safeQuery
    const queryWrapper = async (sql, params = []) => {
      const [rows] = await connection.execute(sql, params);
      return rows;
    };

    // Execute the callback with the query wrapper
    const result = await callback(queryWrapper);

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    Logger.error("Transaction failed:", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    connection.release();
  }
};

// Initialize DB
async function initDB() {
  try {
    const conn = await pool.getConnection();
    Logger.info("Connected to database");
    conn.release();
  } catch (err) {
    Logger.error("Error connecting to the database", {
      error: err,
      stack: err.stack,
    });
    console.error("Failed to connect to MariaDB:", err.message);
  }
}

// Close DB
async function closeDB() {
  await pool.end();
  Logger.info("Database pool closed");
  console.log("Database pool closed.");
}

// Graceful shutdown
process.on("SIGINT", closeDB);
process.on("SIGTERM", closeDB);

// Export
module.exports = {
  pool,
  initDB,
  safeQuery,
  safeQueryOne,
  getConnection,
  transaction, // ADD THIS
  closeDB,
};
