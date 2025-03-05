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
 * Application configuration
 */
const config = {
  // API configuration
  API_BASE_URL: getEnvVar('VITE_API_URL', 'http://localhost:3001'),
  
  // Environment
  NODE_ENV: getEnvVar('VITE_NODE_ENV', 'development'),
  
  // Environment flags
  isDevelopment: getEnvVar('VITE_NODE_ENV', 'development') === 'development',
  isProduction: getEnvVar('VITE_NODE_ENV', 'development') === 'production',
  
  // Feature flags
  ENABLE_ANALYTICS: getEnvVar('VITE_ENABLE_ANALYTICS', 'false') === 'true',
  ENABLE_THEMES: getEnvVar('VITE_ENABLE_THEMES', 'true') === 'true',
  
  // Gemini API
  GEMINI_API_KEY: getEnvVar('VITE_GEMINI_API_KEY', ''),
  ENABLE_AI_FEATURES: getEnvVar('VITE_ENABLE_AI_FEATURES', 'true') === 'true',
};

export default config; 