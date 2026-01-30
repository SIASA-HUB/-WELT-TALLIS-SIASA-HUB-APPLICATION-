const winston = require('winston');
const fs = require('fs');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

// chek  logs    dir 
const logDir =
  isProduction
    ? '/var/log/backendapi'        // Linux 
    : path.join(process.cwd(), 'logs');     

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

//  log format
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.label({ label: 'backend-api' }),
  winston.format.json(),
  winston.format.align()
);


const createFileTransport = (filename, level) =>
  new winston.transports.File({
    filename: path.join(logDir, filename),
    level,
    maxsize: 5 * 1024 * 1024, // 5 MB
    maxFiles: 5,
  });

// Winston logger
const Logger = winston.createLogger({
  level: 'debug',
  format: baseFormat,
  transports: [
    createFileTransport('info.log', 'info'),
    createFileTransport('warn.log', 'warn'),
    createFileTransport('error.log', 'error'),
    createFileTransport('combined.log', 'debug'),

    // Console transport
    new winston.transports.Console({
      level: isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) =>
          stack
            ? `${timestamp} ${level}: ${stack}`
            : `${timestamp} ${level}: ${message}`
        )
      )
    })
  ]
});

// Handle uncaught exceptions & unhandled promise rejections
Logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logDir, 'exceptions.log'),
    maxsize: 5 * 1024 * 1024,
    maxFiles: 5,
  })
);

Logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logDir, 'rejections.log'),
    maxsize: 5 * 1024 * 1024,
    maxFiles: 5,
  })
);

// helper wrapper for easier logging
Logger.logInfo = (message, meta) => Logger.info(message, meta);
Logger.logWarn = (message, meta) => Logger.warn(message, meta);
Logger.logError = (message, meta) => Logger.error(message, meta);

module.exports = Logger;
