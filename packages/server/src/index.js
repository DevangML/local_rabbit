// Server entry point
import path from 'path';
import fs from 'fs';
import url from 'url';
import logger from './utils/logger.js';

// Get current directory with ES modules
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize logger
logger.info(`Server starting in ${process.env.NODE_ENV || 'development'} mode`);
logger.success('Logger initialized successfully');

// Start the server
import('./server.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
