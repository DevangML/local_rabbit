const getEnvVar = (key, defaultValue) => {
  const value = import.meta.env[key];
  return value !== undefined ? value : defaultValue;
};

export const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
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