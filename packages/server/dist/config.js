"use strict";
const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    logging: {
        level: process.env.LOG_LEVEL || 'debug',
        directory: 'logs',
    },
    cors: {
        origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    },
    git: {
        statePath: process.env.GIT_STATE_PATH || 'data/git-state.json',
        defaultBranch: process.env.GIT_DEFAULT_BRANCH || 'main',
        maxDiffSize: parseInt(process.env.GIT_MAX_DIFF_SIZE || '1000000', 10),
    },
};
module.exports = config;
