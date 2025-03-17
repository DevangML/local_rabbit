/**
 * Performance middleware for Express server
 * Implements best practices from Express.js performance guide
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {import('express').RequestHandler} RequestHandler
 */

const compression = require('compression');

/**
 * Compression middleware with custom filter
 * Only compresses responses above a certain size threshold
 * @type {Function}
 */
const compressionMiddleware = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  // Don't compress responses for requests that include
  // the 'x-no-compression' header
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression by default
    return compression.filter(req, res);
  },
  // Use GZIP compression level 6 (balanced between speed and compression)
  level: 6
});

/**
 * Middleware to disable ETags for better performance
 * ETags can cause unnecessary validation requests
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 */
const disableETagMiddleware = (req, res, next) => {
  res.setHeader('etag', 'false');
  next();
};

/**
 * Middleware to set proper cache headers
 * @param {number} maxAge - Max age in seconds
 * @returns {Function} Express middleware function
 */
const cacheControlMiddleware = (maxAge = 86400) => {
  /**
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next function
   * @returns {void}
   */
  return (req, res, next) => {
    // Skip for API routes or dynamic content
    if (req.path.startsWith('/api/') || req.method !== 'GET') {
      res.setHeader('Cache-Control', 'no-store');
    } else {
      // Set cache headers for static content
      res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    }
    next();
  };
};

module.exports = {
  compressionMiddleware,
  disableETagMiddleware,
  cacheControlMiddleware
}; 