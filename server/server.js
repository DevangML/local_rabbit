/**
 * Local CodeRabbit Server
 * Main entry point for the Express server
 */

// Load environment variables
require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/utils/logger');

// Ensure we're using port 3001
config.port = 3001;

// Start the server
const server = app.listen(config.port, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
  logger.info(`API available at http://localhost:${config.port}`);

  // Log all routes for debugging
  const routes = [];
  app._router.stack.forEach(function (middleware) {
    if (middleware.route) { // routes registered directly on the app
      routes.push(middleware.route.path);
    } else if (middleware.name === 'router') { // router middleware 
      middleware.handle.stack.forEach(function (handler) {
        if (handler.route) {
          const path = handler.route.path;
          routes.push(path);
        }
      });
    }
  });

  logger.info(`Available routes: ${routes.join(', ')}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', {
    message: err.message,
    stack: err.stack,
    ...err
  });

  // In development, don't exit the process
  if (config.nodeEnv === 'production') {
    // Close server & exit
    server.close(() => {
      process.exit(1);
    });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', {
    message: err.message,
    stack: err.stack,
    ...err
  });

  // In development, don't exit the process
  if (config.nodeEnv === 'production') {
    // Close server & exit
    server.close(() => {
      process.exit(1);
    });
  }
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = server;
