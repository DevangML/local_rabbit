const getEnvVar = (key, defaultValue) => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

// Using Vite environment variables for frontend
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  FALLBACK_API_ROUTE: '/api/repository/branches',
  NODE_ENV: getEnvVar('VITE_NODE_ENV', 'development'),
  isDevelopment: getEnvVar('VITE_NODE_ENV', 'development') === 'development',
  isProduction: getEnvVar('VITE_NODE_ENV', 'development') === 'production',
};

// Also provide individual exports for convenience
export const {
  API_BASE_URL,
  NODE_ENV,
  isDevelopment,
  isProduction
} = config;