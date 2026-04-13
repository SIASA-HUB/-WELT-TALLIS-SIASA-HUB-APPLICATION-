/**
 * Global Response Helper
 * Standardizes API responses across all microservices.
 */

const Logger = require("../logger/logger");

/**
 * Strips sensitive data from objects/arrays
 * @param {any} data - The data to sanitize
 * @returns {any} Sanitized data
 */
const sanitizeData = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sensitiveFields = ['password', 'password_hash', 'token', 'refresh_token', '__v', 'otp'];
    const sanitized = { ...data };
    
    sensitiveFields.forEach(field => {
      delete sanitized[field];
    });

    // Recursively sanitize any nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitizeData(sanitized[key]);
      }
    });

    return sanitized;
  }

  return data;
};

/**
 * Sends a standardized success response
 */
const sendSuccess = (res, message = "Success", data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: sanitizeData(data)
  });
};

/**
 * Sends a standardized error response
 */
const sendError = (res, message = "Error occurred", statusCode = 500, error = null) => {
  // Only expose error details in development
  const errorDetails = process.env.NODE_ENV === "development" ? error : undefined;

  // Log the error for internal tracking
  if (statusCode >= 500) {
    Logger.error(`[SERVER ERROR] ${message}`, { error, status: statusCode });
  } else {
    Logger.warn(`[API ERROR] ${message}`, { status: statusCode });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sanitizeData
};
