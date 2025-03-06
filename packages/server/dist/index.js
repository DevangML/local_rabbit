const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Test logging
logger.info('Server starting...');
logger.debug('Debug mode enabled');
logger.warn('This is a test warning');
logger.error('This is a test error');
logger.success('Logger initialized successfully');
