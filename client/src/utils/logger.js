class Logger {
  static formatMessage(level, message, meta = {}) {
    const error = new Error();
    const stack = error.stack.split('\n')[2];
    const match = stack.match(/\((.+):(\d+):(\d+)\)$/);
    
    if (match) {
      const [, file, line, column] = match;
      const relativeFile = file.split('/src/')[1] || file;
      return `${relativeFile}:${line}:${column}: ${level} ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ''
      }`;
    }
    
    return `logger.js:1:1: ${level} ${message}`;
  }

  static error(message, meta) {
    const formattedMessage = this.formatMessage('error', message, meta);
    console.error(formattedMessage);
  }

  static warn(message, meta) {
    const formattedMessage = this.formatMessage('warning', message, meta);
    console.warn(formattedMessage);
  }

  static info(message, meta) {
    const formattedMessage = this.formatMessage('info', message, meta);
    console.info(formattedMessage);
  }

  static debug(message, meta) {
    const formattedMessage = this.formatMessage('debug', message, meta);
    console.debug(formattedMessage);
  }
}

export default Logger;
