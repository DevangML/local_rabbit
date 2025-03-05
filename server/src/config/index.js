const path = require('path');
const os = require('os');

/**
 * Configuration settings for the server
 */
const config = {
  // Server settings
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },

  // Database settings
  db: {
    path: process.env.DB_PATH || 'db.sqlite',
  },

  // Git settings
  git: {
    statePath: process.env.GIT_STATE_PATH || path.join(__dirname, '../../.state.json'),
    allowedDirs: [
      'Documents',
      'Projects',
      'Development',
      'Code',
      'Github',
      'repos',
      'git',
      'workspace',
      'dev',
      'Desktop',
    ].map((dir) => path.join(os.homedir(), dir)),
  },

  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: path.join(__dirname, '../../logs'),
  },

  // AI settings
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    enableAiFeatures: process.env.ENABLE_AI_FEATURES === 'true' || true,
  },

  // Security settings
  security: {
    maxFileSize: process.env.MAX_FILE_SIZE || '10mb',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
};

module.exports = config;
