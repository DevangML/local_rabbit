const express = require('express');
// @ts-ignore
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const corsMiddleware = require('./middleware/cors');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Security middleware
// @ts-ignore
app.use(helmet());

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// HTTP request logging
app.use(morgan('dev', {
  stream: {
    write: (message) => logger.info(`HTTP: ${message.trim()}`),
  },
}));

// Custom request logger
app.use(requestLogger);

// API routes
app.use(routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.method} ${req.url} not found` });
});

// Error handler
app.use(errorHandler);

module.exports = app;
