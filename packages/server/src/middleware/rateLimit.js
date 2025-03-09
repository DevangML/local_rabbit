/**
 * Rate limiting middleware for Express server
 * Implements best practices from Express.js performance guide
 */

// We need to install express-rate-limit
// This is a placeholder implementation that can be replaced with the actual package
// after installing it with: npm install express-rate-limit --save

/**
 * Simple in-memory store for rate limiting
 */
class MemoryStore {
  constructor() {
    this.store = new Map();
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Increment the count for an IP
   * @param {string} key - The IP address
   * @param {number} windowMs - The time window in milliseconds
   * @returns {number} - The current count
   */
  increment(key, windowMs) {
    const now = Date.now();
    const record = this.store.get(key) || { count: 0, resetTime: now + windowMs };

    // Reset if the window has expired
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    this.store.set(key, record);
    return record.count;
  }

  /**
   * Get the remaining time until reset for an IP
   * @param {string} key - The IP address
   * @returns {number} - Milliseconds until reset
   */
  getResetTime(key) {
    const record = this.store.get(key);
    return record ? Math.max(0, record.resetTime - Date.now()) : 0;
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Create a rate limiter middleware
 * @typedef {Object} RateLimitOptions
 * @property {number} [windowMs=900000] - Time window in milliseconds (15 minutes by default)
 * @property {number} [max=100] - Maximum number of requests per window
 * @property {string} [message='Too many requests, please try again later.'] - Error message to send
 * @property {number} [statusCode=429] - HTTP status code to send
 * 
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * 
 * @param {RateLimitOptions} [options={}] - Rate limiter options
 * @returns {Function} Express middleware
 */
function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes by default
    max = 100, // 100 requests per windowMs by default
    message = 'Too many requests, please try again later.',
    statusCode = 429, // Too Many Requests
  } = options;

  const store = new MemoryStore();

  /**
   * Express middleware function
   * @param {Request} req - Express request
   * @param {Response} res - Express response
   * @param {NextFunction} next - Express next function
   * @returns {void}
   */
  return (req, res, next) => {
    // Get client IP - simplified to avoid type errors
    const ip = req.ip || '0.0.0.0';

    // Increment the counter
    const count = store.increment(ip, windowMs);

    // Set headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));

    const resetTime = store.getResetTime(ip);
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));

    // If under the limit, proceed
    if (count <= max) {
      return next();
    }

    // Otherwise, send error response
    res.status(statusCode).json({
      error: 'Too Many Requests',
      message,
      retryAfter: Math.ceil(resetTime / 1000),
    });
  };
}

module.exports = rateLimit; 