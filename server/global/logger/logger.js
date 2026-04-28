const winston = require("winston");
const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

// Logs directory
const logDir = isProduction
  ? "/var/log/backendapi"
  : path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Short & clean log format
const shortFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, label }) => {
    if (stack) {
      // Only print the first line of stack
      const shortStack = stack.split("\n")[0];
      return `${timestamp} [${level.toUpperCase()}]${label ? ` [${label}]` : ""}: ${message} | ${shortStack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]${label ? ` [${label}]` : ""}: ${message}`;
  }),
);

// File transport creator
const createFileTransport = (filename, level) =>
  new winston.transports.File({
    filename: path.join(logDir, filename),
    level,
    maxsize: 5 * 1024 * 1024,
    maxFiles: 5,
  });

// Winston logger
const Logger = winston.createLogger({
  level: "debug",
  format: shortFormat,
  defaultMeta: { label: "global-service" },
  exitOnError: false,
  transports: [
    createFileTransport("info.log", "info"),
    createFileTransport("warn.log", "warn"),
    createFileTransport("error.log", "error"),
    createFileTransport("combined.log", "debug"),

    // Console transport
    new winston.transports.Console({
      level: isProduction ? "info" : "debug",
      format: winston.format.combine(winston.format.colorize(), shortFormat),
    }),
  ],
});

// Handle uncaught exceptions & unhandled rejections
Logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logDir, "exceptions.log"),
    maxsize: 5 * 1024 * 1024,
    maxFiles: 5,
  }),
);

Logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logDir, "rejections.log"),
    maxsize: 5 * 1024 * 1024,
    maxFiles: 5,
  }),
);

// Helper wrapper for easier logging
Logger.logInfo = (message, meta) => Logger.info(message, meta);
Logger.logWarn = (message, meta) => Logger.warn(message, meta);
Logger.logError = (message, meta) => Logger.error(message, meta);

module.exports = Logger;
