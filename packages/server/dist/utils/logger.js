const winston = require('winston');
const path = require('path');
const chalk = require('chalk');
const config = require('../config');
// Define log format
// eslint-disable-next-line no-unused-vars
const logFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json());
// Custom formatter for console with enhanced colors using chalk
const consoleFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ level, message, timestamp, ...meta }) => {
    // Define color scheme for different log levels
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
}));
// Add a new format for machine-readable output
const machineFormat = winston.format.printf(({ level, message, _timestamp, file, line, column, ...meta }) => {
    // Default to logger.js if no file is specified
    const sourceFile = file || 'logger.js';
    const sourceLine = line || '1';
    const sourceColumn = column || '1';
    return `${sourceFile}:${sourceLine}:${sourceColumn}: ${level} ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});
// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json()),
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
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }));
}
// Add source location tracking
const addSourceLocation = (file, line, column) => (message, meta = {}) => ({
    ...meta,
    file,
    line,
    column,
    message,
});
// Enhance logging methods with source tracking
const enhanceLogger = (originalLogger) => {
    const enhanced = { ...originalLogger };
    ['error', 'warn', 'info', 'http', 'debug'].forEach((level) => {
        enhanced[level] = (message, meta = {}) => {
            const error = new Error();
            const stack = error.stack.split('\n')[2];
            const match = stack.match(/\((.+):(\d+):(\d+)\)$/);
            if (match) {
                const [, file, line, column] = match;
                const sourceLocation = addSourceLocation(file, line, column);
                return originalLogger[level](message, sourceLocation(message, meta));
            }
            return originalLogger[level](message, meta);
        };
    });
    return enhanced;
};
// Add convenience methods for styled logging
logger.success = (message, meta = {}) => {
    logger.info(`✅ ${message}`, meta);
};
logger.important = (message, meta = {}) => {
    logger.info(`⚠️ ${message}`, meta);
};
logger.highlight = (message, meta = {}) => {
    logger.info(`🔍 ${message}`, meta);
};
logger.section = (title, meta = {}) => {
    logger.info(`\n=== ${title} ===\n`, meta);
};
logger.table = (data, meta = {}) => {
    if (Array.isArray(data)) {
        logger.info(`\n${JSON.stringify(data, null, 2)}`, meta);
    }
    else {
        logger.info(data, meta);
    }
};
// Export the enhanced logger
module.exports = enhanceLogger(logger);
export {};
