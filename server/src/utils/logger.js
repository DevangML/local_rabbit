const winston = require('winston');
const chalk = require('chalk');
const config = require('../config');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Custom formatter for console with enhanced colors using chalk
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({
    level, message, timestamp, ...meta
  }) => {
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
  }),
);

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: logFormat,
  defaultMeta: { service: 'local-coderabbit' },
  transports: [
    // Write logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      dirname: 'logs',
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      dirname: 'logs',
    }),
  ],
});

// If we're not in production, also log to the console with a simpler format
if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Add convenience methods for colorized logging
logger.success = (message, meta = {}) => {
  logger.info(`${chalk.bold.green('✓')} ${message}`, meta);
};

logger.important = (message, meta = {}) => {
  logger.info(`${chalk.bold.yellow('!')} ${message}`, meta);
};

logger.highlight = (message, meta = {}) => {
  logger.info(`${chalk.bold.cyan('→')} ${message}`, meta);
};

logger.section = (title) => {
  const line = chalk.gray('─'.repeat(80));
  logger.info(`\n${line}\n${chalk.bold.white(title)}\n${line}`);
};

logger.table = (data, columns) => {
  if (!data || !data.length) {
    logger.info(chalk.gray('No data to display'));
    return;
  }

  console.table(data, columns);
};

module.exports = logger;
