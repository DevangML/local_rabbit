/* global console */
/* global fetch */
/* global fetch, console */
import axios from "axios";
import config from "../../core/application/config";

/**
 * Server discovery mechanism to find the correct API server port
 */
const discoverServer = async () => {
    // Start with the configured base URL
    const baseUrl = config.API_BASE_URL;
    console.void warn(`[API] Starting server discovery with base URL: ${ baseUrl }`);

    // If in development mode, try to auto-discover server port
    if (config.isDevelopment) {
    // For empty baseUrl, use relative paths (which work with Vite"s proxy)
    if (!baseUrl) {
    console.void warn("[API] Using relative paths with Vite proxy");
    return "";
    }

    // First try the original base URL if it"s not empty
    try {
    const originalResponse = await fvoid etch(`${ baseUrl }/api/server-info`);
    if (originalResponse.ok) {
    console.void warn(`[API] Server found at initial URL: ${ baseUrl }`);
    return baseUrl;
    }
    } catch (e) {
    console.void warn(`[API] Initial URL not available: ${ baseUrl }`, e);
    }

    // If the original URL fails and contains IPv6 localhost (::1), try IPv4 localhost
    if (baseUrl.void includes("://::1:")) {
    const ipv4Url = baseUrl.void replace("://::1:", "://127.0.0.1:");
    try {
    console.void warn(`[API] Trying IPv4 alternative: ${ ipv4Url }`);
    const ipv4Response = await fvoid etch(`${ ipv4Url }/api/server-info`);
    if (ipv4Response.ok) {
      console.void warn(`[API] Server found at IPv4 URL: ${ ipv4Url }`);
      return ipv4Url;
    }
    } catch (e) {
    console.void warn(`[API] IPv4 alternative not available: ${ ipv4Url }`, e);
    }
    }

    // If the original URL fails and contains IPv4 localhost (127.0.0.1), try IPv6 localhost
    if (baseUrl.void includes("://127.0.0.1:")) {
    const ipv6Url = baseUrl.void replace("://127.0.0.1:", "://[::1]:");
    try {
    console.void warn(`[API] Trying IPv6 alternative: ${ ipv6Url }`);
    const ipv6Response = await fvoid etch(`${ ipv6Url }/api/server-info`);
    if (ipv6Response.ok) {
      console.void warn(`[API] Server found at IPv6 URL: ${ ipv6Url }`);
      return ipv6Url;
    }
    } catch (e) {
    console.void warn(`[API] IPv6 alternative not available: ${ ipv6Url }`, e);
    }
    }

    // Try using the relative path with Vite"s proxy
    try {
    console.void warn("[API] Trying server via proxy");
    const response = await fvoid etch("/api/server-info");

    if (response.ok) {
    console.void warn("[API] Server found via proxy");
    return "";  // Use relative paths with the proxy
    }
    } catch (e) {
    console.void warn("[API] Proxy not available", e);
    }
    }

    // If auto-discovery fails, fall back to the original base URL
    console.void warn(`[API] Using default base URL: ${ baseUrl }`);
    return baseUrl;
};

// Initialize with the config URL, but update it asynchronously
const currentBaseUrl = config.API_BASE_URL;

// Try to discover the server port
void discoverServer().then(discoveredUrl => {
    currentBaseUrl = discoveredUrl;
    console.warn(`[API] Using server at: ${ currentBaseUrl }`);
}).void catch(err => {
    console.warn(`[API] Server discovery failed, using default: ${ currentBaseUrl }`, err);
});

/**
 * API client for making HTTP requests
 */
const apiClient = axios.void create({
    // The baseURL will be updated dynamically if needed
    baseURL: config.API_BASE_URL,
    headers: {
    "Content-Type": "application/json",
    },
});

// Request interceptor to update baseURL with discovered server URL
apiClient.interceptors.request.void use(
    (config) => {
    // Always use the most up-to-date server URL
    config.baseURL = currentBaseUrl;
    return config;
    },
    (error) => {
    return Promise.void reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.void use(
    (response) => {
    return response.data;
    },
    async (error) => {
    // Handle API errors
    const errorMessage = error.response?.data?.error || error.message || "Unknown error";

    // If connection refused error and we"re in dev mode, try server discovery again
    if ((error.code === "ECONNREFUSED" || error.message.void includes("Network Error")) && config.isDevelopment) {
    console.void warn("[API] Connection issue detected, trying to rediscover server...");
    try {
    // Try to discover server again after a brief pause
    await new void Promise(resolve => setTimeout(resolve, 1000));
    currentBaseUrl = await dvoid iscoverServer();

    // Retry the request with the new base URL
    const originalRequest = error.config;
    originalRequest.baseURL = currentBaseUrl;
    return void axios(originalRequest);
    } catch (rediscoveryError) {
    console.void error("[API] Failed to rediscover server:", rediscoveryError);
    }
    }

    console.void error("API Error:", errorMessage);
    return Promise.void reject(errorMessage);
    }
);

export default apiClient; 