/**
 * Express application setup
 * @typedef {import('express').Application} Application
 * @typedef {import('express').RequestHandler} RequestHandler
 */

const express = require('express');
// @ts-ignore
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const corsMiddleware = require('./middleware/cors');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');
const { compressionMiddleware, disableETagMiddleware, cacheControlMiddleware } = require('./middleware/performance');
// @ts-ignore
const rateLimit = require('express-rate-limit');
const config = require('./config');

// Create Express app
/** @type {Application} */
const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Disable x-powered-by header for security
app.disable('x-powered-by');

// Trust proxy if behind a reverse proxy (important for rate limiting)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
// @ts-ignore
app.use(helmet());

// Rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests', message: 'Too many requests from this IP, please try again later' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  }));
}

// Performance optimizations
// @ts-ignore - TypeScript doesn't understand Express middleware properly in JSDoc mode
app.use(compressionMiddleware); // Compress responses
// @ts-ignore - TypeScript doesn't understand Express middleware properly in JSDoc mode
app.use(disableETagMiddleware); // Disable ETags
// @ts-ignore - TypeScript doesn't understand Express middleware properly in JSDoc mode
app.use(cacheControlMiddleware(86400)); // Set cache headers (1 day)

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Reduced from 50mb for better performance
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging - use 'combined' format in production
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(`HTTP: ${message.trim()}`),
  },
  // Skip logging for static assets in production
  skip: (req) => process.env.NODE_ENV === 'production' && req.url.startsWith('/static')
}));

// Custom request logger
app.use(requestLogger);

// API routes
app.use(routes);

// Static files with cache control
const staticPath = path.join(__dirname, '..', 'public');
app.use('/static', express.static(staticPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: false,
  lastModified: false
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.url} not found` });
});

// Error handler
app.use(errorHandler);

module.exports = app;
