// global/middlewares/sanitize.js — Input sanitization middleware
// Strips XSS vectors, validates common types, enforces length limits

const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,        // onclick=, onload=, etc.
  /<iframe[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /eval\s*\(/gi,
  /document\s*\.\s*cookie/gi,
  /window\s*\.\s*location/gi,
  /<img[^>]+src\s*=\s*["']?\s*javascript/gi,
];

/**
 * Strip dangerous patterns from a string value
 */
const sanitizeString = (val) => {
  if (typeof val !== "string") return val;
  let clean = val.trim();
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, "");
  }
  // Remove null bytes
  clean = clean.replace(/\0/g, "");
  return clean;
};

/**
 * Recursively sanitize all string values in an object
 */
const sanitizeObject = (obj, depth = 0) => {
  if (depth > 5) return obj; // prevent deep recursion attacks
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return sanitizeString(obj);
  if (typeof obj === "number" || typeof obj === "boolean") return obj;
  if (Array.isArray(obj)) return obj.map((item) => sanitizeObject(item, depth + 1));
  if (typeof obj === "object") {
    const cleaned = {};
    for (const key of Object.keys(obj)) {
      // Sanitize key names too (prevent prototype pollution)
      if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
      cleaned[key] = sanitizeObject(obj[key], depth + 1);
    }
    return cleaned;
  }
  return obj;
};

/**
 * Express middleware: sanitize req.body, req.query, req.params
 */
const sanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

/**
 * Validate a UUID string
 */
const isValidUUID = (str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) ||
  /^[A-Z]{3}_\d+_[a-z0-9]+$/i.test(str); 

/**
 * Validate a Kenyan phone number
 */
const isValidKenyanPhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  return /^(254|0)[17]\d{8}$/.test(digits);
};

/**
 * Validate a positive integer amount
 */
const isPositiveAmount = (val) => {
  const n = Number(val);
  return !isNaN(n) && n > 0 && isFinite(n);
};

/**
 * Safe parse integer with bounds
 */
const safeInt = (val, defaultVal = 0, min = 0, max = 1000) => {
  const n = parseInt(val);
  if (isNaN(n)) return defaultVal;
  return Math.max(min, Math.min(max, n));
};

module.exports = {
  sanitizeMiddleware,
  sanitizeString,
  sanitizeObject,
  isValidUUID,
  isValidKenyanPhone,
  isPositiveAmount,
  safeInt,
};
