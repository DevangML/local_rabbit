/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} - Environment variable value or default
 */
const getEnvVar = (key, defaultValue) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  return process.env[key] || defaultValue;
};

/**
 * Auto-detect server URL, with fallbacks to common ports
 * @returns {string} The base API URL
 */
const detectServerUrl = () => {
  // First check for environment variable
  const configuredUrl = getEnvVar('VITE_API_URL', '');
  if (configuredUrl) {return configuredUrl;}

  // For local development, use the configured port from environment
  const apiPort = getEnvVar('VITE_API_PORT', '3001');
  const hostname = window.location.hostname || 'localhost';

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    // Prefer IPv4 localhost for compatibility
    return `http://127.0.0.1:${apiPort}`;
  }

  // In production, assume API is on the same host
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}`;
};

/**
 * Application configuration
 */
const config = {
  // API configuration
  API_BASE_URL: detectServerUrl(),

  // Environment
  NODE_ENV: getEnvVar('VITE_NODE_ENV', 'development'),

  // Environment flags
  isDevelopment: getEnvVar('VITE_NODE_ENV', 'development') === 'development',
  isProduction: getEnvVar('VITE_NODE_ENV', 'development') === 'production',

  // Feature flags
  ENABLE_ANALYTICS: getEnvVar('VITE_ENABLE_ANALYTICS', 'false') === 'true',
  ENABLE_THEMES: getEnvVar('VITE_ENABLE_THEMES', 'true') === 'true',

  // Gemini API
  // To get a valid API key, visit https://ai.google.dev/, sign in,
  // and create an API key in the Google AI Studio.
  // Then set it in your .env file as VITE_GEMINI_API_KEY
  GEMINI_API_KEY: getEnvVar('VITE_GEMINI_API_KEY', ''),
  ENABLE_AI_FEATURES: getEnvVar('VITE_ENABLE_AI_FEATURES', 'true') === 'true',
};

// Debug: Log client configuration
console.log('[CLIENT] Config initialized:', {
  apiBaseUrl: config.API_BASE_URL,
  nodeEnv: config.NODE_ENV,
  isDevelopment: config.isDevelopment
});

// Safe development-only API key validation
if (process.env.NODE_ENV === 'development') {
  if (!config.GEMINI_API_KEY) {
    console.warn('[DEV] No Gemini API key found in client environment variables');
  } else {
    console.log('[DEV] Gemini API key is configured');
  }
}

export default config; 