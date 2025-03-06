"use strict";
const cors = require('cors');
const config = require('../config');
/**
 * CORS middleware configuration
 */
const corsMiddleware = cors({
    origin: config.cors.origin,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    credentials: config.cors.credentials,
    optionsSuccessStatus: 200,
});
module.exports = corsMiddleware;
