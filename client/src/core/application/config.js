/**
 * Get environment variable
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} - Environment variable value or default
 */
const getEnvVar = (key, defaultValue) => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

/**
 * Application configuration
 */
export const config = {
  // API configuration
  API_BASE_URL: getEnvVar('VITE_API_URL', 'http://localhost:3001'),
  
  // Environment
  NODE_ENV: getEnvVar('VITE_NODE_ENV', 'development'),
  isDevelopment: getEnvVar('VITE_NODE_ENV', 'development') === 'development',
  isProduction: getEnvVar('VITE_NODE_ENV', 'development') === 'production',
  
  // Feature flags
  features: {
    enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS', false),
    enableThemes: true,
  },
}; 