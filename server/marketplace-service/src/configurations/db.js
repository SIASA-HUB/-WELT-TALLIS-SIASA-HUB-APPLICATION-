const { db } = require("../../../global/index");
const Logger = require("../utils/logger/logger");

// Use global database utilities
const pool = db.pool;
const safeQuery = db.safeQuery;
const safeQueryOne = db.safeQueryOne;

// Get raw connection (transactions)
async function getConnection() {
    return db.getConnection();
}

// Initialize DB (No-op as it's handled globally, but kept for compatibility)
async function initDB() {
    try {
        Logger.info(`Using global database connection`);
        return true;
    } catch (err) {
        Logger.error(`Error with global database`, { error: err });
        return false;
    }
}

// Close DB
async function closeDB() {
    // Handled by global process handlers, but kept for compatibility
    Logger.info(`database pool referenced from global`);
}

// Export
module.exports = {
    pool,
    initDB,
    safeQuery,
    safeQueryOne,
    getConnection,
    closeDB,
};
