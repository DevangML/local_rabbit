/**
 * Global error handling middleware
 * Provides consistent error responses with detailed information
 */
const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  // Extract or generate error information
  const status = err.status || err.statusCode || 500;
  const error = err.message || 'Internal Server Error';

  // Get source location information
  const stack = err.stack || new Error().stack;
  const lineMatch = stack.split('\n')[1]?.match(/(\d+):\d+\)/);
  const lineNumber = err.lineNumber || (lineMatch ? lineMatch[1] : null);

  // Log the error
  logger.error(`Error: ${error}`);
  if (stack) {
    logger.error(`Stack: ${stack}`);
  }

  // Generate a standardized error response
  const errorResponse = {
    error,
    status,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    details: err.details || err.cause || null,
    line: lineNumber
  };

  // Include stack trace in development mode only
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = stack;
  }

  // Send the error response
  res.status(status).json(errorResponse);
};

module.exports = errorHandler;
