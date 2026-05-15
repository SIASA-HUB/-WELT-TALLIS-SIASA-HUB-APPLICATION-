/**
 * Simple Logger for M-Pesa Service
 */
const Logger = {
  info: (msg, ...args) => {
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, ...args);
  }
};

export default Logger;
