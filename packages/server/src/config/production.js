/**
 * Production environment configuration
 * Implements best practices from Express.js performance guide
 */

module.exports = {
  // Server settings
  server: {
    // Trust proxy when behind a reverse proxy like Nginx
    trustProxy: true,
    // Disable x-powered-by header for security
    hidePoweredBy: true,
    // Enable view caching
    viewCache: true,
    // Disable verbose error messages
    verboseErrors: false,
  },

  // Performance settings
  performance: {
    // Enable compression
    compression: true,
    // Disable ETags
    disableETag: true,
    // Cache control settings
    cache: {
      enabled: true,
      // Cache static assets for 1 day (in seconds)
      staticMaxAge: 86400,
    },
  },

  // Logging settings
  logging: {
    // Log level for production
    level: 'info',
    // Log format for production
    format: 'combined',
    // Enable log rotation
    rotation: true,
  },

  // Security settings
  security: {
    // Enable Helmet security headers
    helmet: true,
    // Rate limiting settings
    rateLimit: {
      enabled: true,
      // Max requests per window
      max: 100,
      // Time window in milliseconds (15 minutes)
      windowMs: 15 * 60 * 1000,
    },
  },
}; 