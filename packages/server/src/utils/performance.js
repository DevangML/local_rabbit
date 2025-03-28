/**
 * Performance utilities using Lodash and Async
 * This file provides optimized utility functions for common operations
 */

const _ = require('lodash');
const async = require('async');
const chalk = require('chalk');
const logger = require('./logger');

/**
 * Memoize a function with optional TTL (time to live)
 * @param {Function} fn - Function to memoize
 * @param {Object} options - Options object
 * @param {number} [options.maxAge=60000] - Cache TTL in milliseconds (default: 1 minute)
 * @param {number} [options.maxSize=100] - Maximum cache size
 * @param {Function} [options.resolver] - Custom cache key resolver
 * @returns {Function} Memoized function
 */
const memoizeWithTTL = (fn, options = {}) => {
  const {
    maxAge = 60000,
    maxSize = 100,
    resolver = undefined,
  } = options;

  // Initialize maps for cache and timestamps
  const cache = new Map();
  const timestamps = new Map();

  // Create the memoized function
  const memoized = _.memoize(
    function () {
      const args = Array.from(arguments);
      const now = Date.now();
      const key = resolver ? resolver.apply(null, args) : JSON.stringify(args);

      // Set timestamp for this key
      timestamps.set(key, now);

      // Clean up old entries if cache exceeds maxSize
      if (cache.size > maxSize) {
        const entries = Array.from(timestamps.entries());
        if (entries.length > 0) {
          const oldestKey = entries.sort(([, a], [, b]) => a - b)[0][0];
          cache.delete(oldestKey);
          timestamps.delete(oldestKey);
        }
      }

      return fn.apply(null, args);
    },
    resolver,
  );

  // Wrap the memoized function to check TTL
  return function () {
    const args = Array.from(arguments);
    const key = resolver ? resolver.apply(null, args) : JSON.stringify(args);
    const timestamp = timestamps.get(key);

    if (timestamp && Date.now() - timestamp > maxAge) {
      cache.delete(key);
      timestamps.delete(key);
    }

    return memoized.apply(null, args);
  };
};

/**
 * Run tasks in parallel with concurrency control
 * @param {Array<any>} items - Array of items to process
 * @param {Function} task - Task function that returns a promise
 * @param {Object} options - Options object
 * @param {number} [options.concurrency=5] - Maximum number of concurrent tasks
 * @param {boolean} [options.stopOnError=false] - Whether to stop on first error
 * @returns {Promise<Array<any>>} Results array
 */
const parallelizeTask = async (items, task, options = {}) => {
  const {
    concurrency = 5,
    stopOnError = false,
  } = options;

  const startTime = Date.now();
  logger.info(
    chalk.blue(
      `Starting parallel execution of ${items.length} tasks with concurrency ${concurrency}`,
    ),
  );

  try {
    const results = await async.mapLimit(
      items,
      concurrency,
      async (item) => {
        try {
          return await task(item);
        } catch (error) {
          if (stopOnError) {
            throw error;
          }
          if (error instanceof Error) {
            logger.error(chalk.red(`Error processing item: ${error.message}`));
            return { error: error.message, item };
          }
          logger.error(chalk.red(`Error processing item: Unknown error`));
          return { error: 'Unknown error', item };
        }
      },
    );

    const duration = Date.now() - startTime;
    logger.info(chalk.green(`Completed parallel execution in ${duration}ms`));

    return results;
  } catch (error) {
    const duration = Date.now() - startTime;
    if (error instanceof Error) {
      logger.error(chalk.red(`Parallel execution failed after ${duration}ms: ${error.message}`));
    } else {
      logger.error(chalk.red(`Parallel execution failed after ${duration}ms: Unknown error`));
    }
    throw error;
  }
};

/**
 * Throttle a function to limit its execution rate
 * @param {Function} fn - Function to throttle
 * @param {number} [wait=1000] - Throttle wait time in milliseconds
 * @returns {Function} Throttled function
 */
const throttleFunction = (fn, wait = 1000) => {
  return _.throttle(fn, wait, {
    leading: true,
    trailing: true,
  });
};

/**
 * Debounce a function to delay its execution
 * @param {Function} fn - Function to debounce
 * @param {number} [wait=300] - Debounce wait time in milliseconds
 * @returns {Function} Debounced function
 */
const debounceFunction = (fn, wait = 300) => {
  return _.debounce(fn, wait, {
    leading: false,
    trailing: true,
    maxWait: wait * 3,
  });
};

/**
 * Batch process an array of items
 * @param {Array<any>} items - Array of items to process
 * @param {Function} processFn - Function to process each batch
 * @param {number} [batchSize=100] - Size of each batch
 * @returns {Promise<Array<any>>} Combined results
 */
const batchProcess = async (items, processFn, batchSize = 100) => {
  const startTime = Date.now();
  logger.info(
    chalk.blue(
      `Starting batch processing of ${items.length} items with batch size ${batchSize}`,
    ),
  );

  const batches = _.chunk(items, batchSize);
  const results = [];

  for (let i = 0; i < batches.length; i += 1) {
    const batchStartTime = Date.now();
    logger.info(chalk.yellow(`Processing batch ${i + 1}/${batches.length}`));

    // eslint-disable-next-line no-await-in-loop
    const batchResults = await processFn(batches[i]);
    results.push(...batchResults);

    const batchDuration = Date.now() - batchStartTime;
    logger.info(chalk.yellow(`Batch ${i + 1} completed in ${batchDuration}ms`));
  }

  const duration = Date.now() - startTime;
  logger.info(chalk.green(`Completed batch processing in ${duration}ms`));

  return results;
};

module.exports = {
  memoizeWithTTL,
  parallelizeTask,
  throttleFunction,
  debounceFunction,
  batchProcess,
  _,
  async,
};
