const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    directory: 'logs',
  },
};

module.exports = config;
