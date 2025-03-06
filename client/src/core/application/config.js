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
  if (configuredUrl) return configuredUrl;

  // For local development, use relative path to work with Vite's proxy
  const hostname = window.location.hostname || 'localhost';
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // In development, rely on the proxy configuration in Vite
    // This prevents CORS issues by proxying all API requests
    return '';  // Empty string means use relative paths
  }

  // In production, assume API is on the same host
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}`;
};

/**
 * Application configuration
 */
const config = {
  // API configuration - dynamically determine base URL
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

// Debug: Log API key information (client-side)
const debugKey = config.GEMINI_API_KEY;
if (debugKey) {
  const keyLength = debugKey.length;
  const firstChars = debugKey.substring(0, 4);
  const lastChars = keyLength > 4 ? debugKey.substring(keyLength - 4) : '';
  console.log(`[CLIENT] Gemini API key loaded with length ${keyLength}. Key starts with ${firstChars}... and ends with ...${lastChars}`);
} else {
  console.warn('[CLIENT] No Gemini API key found in client environment variables');
}

export default config; 