"use strict";
const logger = require('../utils/logger');
/**
 * Request logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Log request
    logger.info(`${req.method} ${req.url}`, {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMethod = res.statusCode >= 400 ? 'warn' : 'info';
        logger[logMethod](`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`, {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
        });
    });
    next();
};
module.exports = requestLogger;
