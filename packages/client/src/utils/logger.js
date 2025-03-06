/**
 * Logger utility for consistent logging across the application
 */
export class Logger {
  /**
   * Format a log message with location and metadata
   * @param {string} level - Log level (error, warn, info, debug)
   * @param {string} message - Message to log
   * @param {Object} [metadata] - Optional metadata to include
   * @returns {string} - Formatted message
   */
  static formatMessage(level, message, metadata = null) {
    const error = new Error();
    const stackLines = error.stack.split('\n');
    let location = 'unknown:0:0';

    // Find the first line that's not from this file
    for (const line of stackLines) {
      if (line.includes('at ') && !line.includes('logger.js')) {
        const match = line.match(/\((.*?):(\d+):(\d+)\)/) || line.match(/at (.*?):(\d+):(\d+)/);
        if (match) {
          const [, file, lineNum, colNum] = match;
          const srcIndex = file.indexOf('src/');
          location = srcIndex >= 0 ? file.slice(srcIndex) : `${file}:${lineNum}:${colNum}`;
          break;
        }
      }
    }

    const formattedMessage = `[${level.toUpperCase()}] [${location}] ${message}`;
    return metadata ? `${formattedMessage} ${JSON.stringify(metadata)}` : formattedMessage;
  }

  /**
   * Log an error message
   * @param {string} message - Error message
   * @param {Object} [metadata] - Optional metadata
   */
  static error(message, metadata = null) {
    console.error(this.formatMessage('error', message, metadata));
  }

  /**
   * Log a warning message
   * @param {string} message - Warning message
   * @param {Object} [metadata] - Optional metadata
   */
  static warn(message, metadata = null) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(this.formatMessage('warn', message, metadata));
    }
  }

  /**
   * Log an info message
   * @param {string} message - Info message
   * @param {Object} [metadata] - Optional metadata
   */
  static info(message, metadata = null) {
    console.info(this.formatMessage('info', message, metadata));
  }

  /**
   * Log a debug message
   * @param {string} message - Debug message
   * @param {Object} [metadata] - Optional metadata
   */
  static debug(message, metadata = null) {
    console.debug(this.formatMessage('debug', message, metadata));
  }
}
