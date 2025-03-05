import axios from 'axios';
import { config } from '../../core/application/config';

/**
 * API client for making HTTP requests
 */
const apiClient = axios.create({
  baseURL: config.API_BASE_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens or other headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle API errors
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
    console.error('API Error:', errorMessage);
    return Promise.reject(errorMessage);
  }
);

export default apiClient; 