const logger = require('../utils/logger');
const config = require('../config');

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const status = err.status || 500;
  const response = {
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong'
  };

  if (isDevelopment) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};

module.exports = errorHandler;
