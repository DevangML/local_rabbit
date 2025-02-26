// API Configuration
const API_PORT = process.env.REACT_APP_API_PORT || '3001';
const API_HOST = process.env.REACT_APP_API_HOST || 'localhost';
const API_PROTOCOL = process.env.REACT_APP_API_PROTOCOL || 'http';

export const API_BASE_URL = `${API_PROTOCOL}://${API_HOST}:${API_PORT}`;

// Other configuration values can be added here
export const DEFAULT_CONFIG = {
  maxRetries: 3,
  timeout: 30000,
}; 