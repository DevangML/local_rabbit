import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import config from '../config.js';

// Define current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log format
// eslint-disable-next-line no-unused-vars
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Custom formatter for console with enhanced colors using chalk
const _consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({
    /** @type {string} */ level,
    /** @type {string} */ message,
    /** @type {string} */ timestamp,
    ...meta
  }) => {
    // Define color scheme for different log levels
    /**
     * Colorize text based on log level
     * @param {string} text - The text to colorize
     * @param {string} lvl - The log level
     * @returns {string} Colorized text
     */
    const colorize = (text, lvl) => {
      switch (lvl) {
        case 'error':
          return chalk.bold.red(text);
        case 'warn':
          return chalk.keyword('orange')(text);
        case 'info':
          return chalk.bold.blue(text);
        case 'http':
          return chalk.magenta(text);
        case 'verbose':
          return chalk.cyan(text);
        case 'debug':
          return chalk.green(text);
        case 'silly':
          return chalk.grey(text);
        default:
          return text;
      }
    };

    const colorizedLevel = colorize(level.toUpperCase(), level);
    const colorizedTimestamp = chalk.gray(timestamp);
    const metadata = Object.keys(meta).length
      ? chalk.gray(JSON.stringify(meta, null, 2))
      : '';

    return `${colorizedTimestamp} ${colorizedLevel}: ${message} ${metadata}`;
  }),
);

// Add a new format for machine-readable output
const _machineFormat = winston.format.printf(({
  /** @type {string} */ level,
  /** @type {string} */ message,
  /** @type {string} */ _timestamp,
  /** @type {string|undefined} */ file,
  /** @type {string|undefined} */ line,
  /** @type {string|undefined} */ column,
  ...meta
}) => {
  // Default to logger.js if no file is specified
  const sourceFile = file || 'logger.js';
  const sourceLine = line || '1';
  const sourceColumn = column || '1';

  return `${sourceFile}:${sourceLine}:${sourceColumn}: ${level} ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''
    }`;
});

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }));
}

// Add source location tracking
/**
 * Adds source location information to log metadata
 * @param {string} file - Source file path
 * @param {string} line - Source line number
 * @param {string} column - Source column number
 * @returns {function} Function that adds source location to log message
 */
const addSourceLocation = (file, line, column) => /**
 * @param {string} message - The log message
 * @param {Object} meta - Additional metadata
 * @returns {Object} Enhanced metadata with source location
 */
  (message, meta = {}) => ({
    ...meta,
    file,
    line,
    column,
    message,
  });

/**
 * Enhance logger with source tracking
 * @param {import('winston').Logger} originalLogger - The Winston logger to enhance
 * @returns {import('winston').Logger} Enhanced logger with source tracking
 */
const enhanceLogger = (originalLogger) => {
  /** @type {Record<string, any>} */
  const enhanced = { ...originalLogger };

  // Type assertion to allow string indexing
  /** @type {Record<string, Function>} */
  const typedLogger = /** @type {any} */ (originalLogger);

  ['error', 'warn', 'info', 'http', 'debug'].forEach((level) => {
    /**
     * @param {string} message - The log message
     * @param {Object} meta - Additional metadata
     */
    enhanced[level] = (message, meta = {}) => {
      // Ensure the logger method exists
      if (typeof typedLogger[level] !== 'function') {
        console.error(`Logger method ${level} is not a function`);
        return;
      }

      const error = new Error();
      // Add null check for stack
      if (!error.stack) {
        return typedLogger && typeof typedLogger[level] === 'function'
          ? typedLogger[level](message, meta)
          : console.log(message);
      }
      const stack = error.stack.split('\n')[2];
      if (!stack) {
        return typedLogger && typeof typedLogger[level] === 'function'
          ? typedLogger[level](message, meta)
          : console.log(message);
      }
      const match = stack.match(/\((.+):(\d+):(\d+)\)$/);
      if (match) {
        // Provide default values to ensure strings
        const [, file = 'unknown', line = '0', column = '0'] = match;
        const sourceLocation = addSourceLocation(file, line, column);
        return typedLogger && typeof typedLogger[level] === 'function'
          ? typedLogger[level](message, sourceLocation(message, meta))
          : console.log(message);
      }
      return typedLogger && typeof typedLogger[level] === 'function'
        ? typedLogger[level](message, meta)
        : console.log(message);
    };
  });

  return /** @type {import('winston').Logger} */ (enhanced);
};

// Before the convenience methods, add type declaration
/**
 * @typedef {Object} ExtendedLoggerMethods
 * @property {Function} success - Log a success message
 * @property {Function} important - Log an important message
 * @property {Function} highlight - Log a highlighted message
 * @property {Function} section - Log a section title
 * @property {Function} table - Log data as a table
 */

/**
 * @type {import('winston').Logger & ExtendedLoggerMethods}
 */
const typedLogger = /** @type {any} */ (logger);

// Add convenience methods for styled logging
/**
 * Log a success message
 * @param {string} message - The success message
 * @param {Object} meta - Additional metadata
 */
typedLogger.success = (message, meta = {}) => {
  logger.info(`✅ ${message}`, meta);
};

/**
 * Log an important message
 * @param {string} message - The important message
 * @param {Object} meta - Additional metadata
 */
typedLogger.important = (message, meta = {}) => {
  logger.info(`⚠️ ${message}`, meta);
};

/**
 * Log a highlighted message
 * @param {string} message - The highlighted message
 * @param {Object} meta - Additional metadata
 */
typedLogger.highlight = (message, meta = {}) => {
  logger.info(`🔍 ${message}`, meta);
};

/**
 * Log a section title
 * @param {string} title - The section title
 * @param {Object} meta - Additional metadata
 */
typedLogger.section = (title, meta = {}) => {
  logger.info(`\n=== ${title} ===\n`, meta);
};

/**
 * Log data as a table
 * @param {any} data - The data to log
 * @param {Object} meta - Additional metadata
 */
typedLogger.table = (data, meta = {}) => {
  if (Array.isArray(data)) {
    logger.info(`\n${JSON.stringify(data, null, 2)}`, meta);
  } else {
    logger.info(data, meta);
  }
};

// Export the enhanced logger
const enhancedLogger = enhanceLogger(logger);
export default enhancedLogger;
