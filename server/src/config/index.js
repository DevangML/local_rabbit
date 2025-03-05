/**
 * Configuration settings for the server
 */
const config = {
  // Server settings
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  
  // Database settings
  db: {
    path: process.env.DB_PATH || 'db.sqlite'
  },
  
  // Git settings
  git: {
    statePath: process.env.GIT_STATE_PATH || '.state.json'
  },
  
  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

module.exports = config; 