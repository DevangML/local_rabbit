import axios from 'axios';
import config from '../../core/application/config';

/**
 * Server discovery mechanism to find the correct API server port
 */
const discoverServer = async () => {
  // Start with the configured base URL
  let baseUrl = config.API_BASE_URL;
  console.log(`[API] Starting server discovery with base URL: ${baseUrl}`);

  // If in development mode, try to auto-discover server port
  if (config.isDevelopment) {
    // For empty baseUrl, use relative paths (which work with Vite's proxy)
    if (!baseUrl) {
      console.log('[API] Using relative paths with Vite proxy');
      return '';
    }

    // First try the original base URL if it's not empty
    try {
      const originalResponse = await fetch(`${baseUrl}/api/server-info`);
      if (originalResponse.ok) {
        console.log(`[API] Server found at initial URL: ${baseUrl}`);
        return baseUrl;
      }
    } catch (e) {
      console.log(`[API] Initial URL not available: ${baseUrl}`);
    }

    // If the original URL fails and contains IPv6 localhost (::1), try IPv4 localhost
    if (baseUrl.includes('://::1:')) {
      const ipv4Url = baseUrl.replace('://::1:', '://127.0.0.1:');
      try {
        console.log(`[API] Trying IPv4 alternative: ${ipv4Url}`);
        const ipv4Response = await fetch(`${ipv4Url}/api/server-info`);
        if (ipv4Response.ok) {
          console.log(`[API] Server found at IPv4 URL: ${ipv4Url}`);
          return ipv4Url;
        }
      } catch (e) {
        console.log(`[API] IPv4 alternative not available: ${ipv4Url}`);
      }
    }

    // If the original URL fails and contains IPv4 localhost (127.0.0.1), try IPv6 localhost
    if (baseUrl.includes('://127.0.0.1:')) {
      const ipv6Url = baseUrl.replace('://127.0.0.1:', '://[::1]:');
      try {
        console.log(`[API] Trying IPv6 alternative: ${ipv6Url}`);
        const ipv6Response = await fetch(`${ipv6Url}/api/server-info`);
        if (ipv6Response.ok) {
          console.log(`[API] Server found at IPv6 URL: ${ipv6Url}`);
          return ipv6Url;
        }
      } catch (e) {
        console.log(`[API] IPv6 alternative not available: ${ipv6Url}`);
      }
    }

    // Try using the relative path with Vite's proxy
    try {
      console.log('[API] Trying server via proxy');
      const response = await fetch('/api/server-info');

      if (response.ok) {
        console.log('[API] Server found via proxy');
        return '';  // Use relative paths with the proxy
      }
    } catch (e) {
      console.log('[API] Proxy not available', e);
    }
  }

  // If auto-discovery fails, fall back to the original base URL
  console.log(`[API] Using default base URL: ${baseUrl}`);
  return baseUrl;
};

// Initialize with the config URL, but update it asynchronously
let currentBaseUrl = config.API_BASE_URL;

// Try to discover the server port
discoverServer().then(discoveredUrl => {
  currentBaseUrl = discoveredUrl;
  console.log(`[API] Using server at: ${currentBaseUrl}`);
}).catch(err => {
  console.warn(`[API] Server discovery failed, using default: ${currentBaseUrl}`, err);
});

/**
 * API client for making HTTP requests
 */
const apiClient = axios.create({
  // The baseURL will be updated dynamically if needed
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to update baseURL with discovered server URL
apiClient.interceptors.request.use(
  (config) => {
    // Always use the most up-to-date server URL
    config.baseURL = currentBaseUrl;
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
  async (error) => {
    // Handle API errors
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';

    // If connection refused error and we're in dev mode, try server discovery again
    if ((error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) && config.isDevelopment) {
      console.log('[API] Connection issue detected, trying to rediscover server...');
      try {
        // Try to discover server again after a brief pause
        await new Promise(resolve => setTimeout(resolve, 1000));
        currentBaseUrl = await discoverServer();

        // Retry the request with the new base URL
        const originalRequest = error.config;
        originalRequest.baseURL = currentBaseUrl;
        return axios(originalRequest);
      } catch (rediscoveryError) {
        console.error('[API] Failed to rediscover server:', rediscoveryError);
      }
    }

    console.error('API Error:', errorMessage);
    return Promise.reject(errorMessage);
  }
);

export default apiClient; 