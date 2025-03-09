/**
 * Cluster implementation for Express server
 * Implements best practices from Express.js performance guide
 * 
 * This file enables the server to use all available CPU cores
 * by creating worker processes, improving performance and reliability.
 */

const cluster = require('cluster');
const os = require('os');
const logger = require('./utils/logger');

/**
 * Get the number of workers to spawn
 * In production, use all available CPUs
 * In development, use just one worker
 * @returns {number} Number of workers to spawn
 */
function getNumWorkers() {
  const numCPUs = os.cpus().length;

  // In production, use all available CPUs
  // In development, just use one worker
  return process.env.NODE_ENV === 'production'
    ? numCPUs
    : 1;
}

/**
 * Start the cluster master process
 * @param {Function} startWorker - Function to start a worker
 */
function startMaster(startWorker) {
  const numWorkers = getNumWorkers();

  logger.info(`Master cluster setting up ${numWorkers} workers`);

  // Fork workers
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  // Handle worker events
  cluster.on('online', (worker) => {
    logger.info(`Worker ${worker.process.pid} is online`);
  });

  // If a worker dies, restart it
  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`);
    logger.info('Starting a new worker');
    cluster.fork();
  });
}

/**
 * Start the application in cluster mode
 * @param {Function} startApp - Function to start the application
 */
function startCluster(startApp) {
  // If we're running in cluster mode and this is the master process
  if (cluster.isMaster) {
    startMaster();
  } else {
    // This is a worker process, so start the app
    startApp();
  }
}

module.exports = {
  startCluster,
  getNumWorkers
}; 