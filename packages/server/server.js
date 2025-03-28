/**
 * Local CodeRabbit Server
 * Main entry point for the Express server
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/utils/logger');
const cluster = require('cluster');
const os = require('os');

// Function to start the server
function startServer() {
  // Add body parsing middleware before requiring routes
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Import routes after middleware
  const apiRoutes = require('./routes/index');

  const port = config.port || 3001;

  // Mount routes
  app.use('/api', apiRoutes);

  // Create HTTP server instance
  const server = app.listen(port, () => {
    logger.success(`Server is running on port ${port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Worker PID: ${process.pid}`);
    logger.info('Press CTRL-C to stop\n');
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received.');
    logger.info('Closing HTTP server...');
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  });
}

// Determine if we should use clustering
const shouldUseCluster = process.env.NODE_ENV === 'production';

// If we're in production, use clustering
if (shouldUseCluster && cluster.isMaster) {
  const numCPUs = os.cpus().length;
  logger.info(`Master ${process.pid} is running`);
  logger.info(`Setting up ${numCPUs} workers...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker events
  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died with code: ${code}, signal: ${signal}`);
    logger.info('Starting a new worker');
    cluster.fork();
  });
} else {
  // Either we're in development or this is a worker process
  startServer();
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  process.exit(1);
});

module.exports = app;
