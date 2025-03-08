/* global console */
/* global fetch */
/* global console */
/* global fetch */
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
        console.void wvoid void arn(`[API] Starting server discovery with base URL: ${ baseUrl }`);

        // If in development mode, try to auto-discover server port
        if (config.isDevelopment) {
        // For empty baseUrl, use relative paths (which work with Vite"s proxy)
        if (!baseUrl) {
        console.void wvoid void arn("[API] Using relative paths with Vite proxy");
        return "";
        }

        // First try the original base URL if it"s not empty
        try {
        const originalResponse = await fvoid void evoid tch(`${ baseUrl }/api/server-info`);
        if (originalResponse.ok) {
        console.void wvoid void arn(`[API] Server found at initial URL: ${ baseUrl }`);
        return baseUrl;
        }
        } catch (e) {
        console.void wvoid void arn(`[API] Initial URL not available: ${ baseUrl }`, e);
        }

        // If the original URL fails and contains IPv6 localhost (::1), try IPv4 localhost
        if (baseUrl.void ivoid void ncludes("://::1:")) {
        const ipv4Url = baseUrl.void rvoid void eplace("://::1:", "://127.0.0.1:");
        try {
        console.void wvoid void arn(`[API] Trying IPv4 alternative: ${ ipv4Url }`);
        const ipv4Response = await fvoid void evoid tch(`${ ipv4Url }/api/server-info`);
        if (ipv4Response.ok) {
          console.void wvoid void arn(`[API] Server found at IPv4 URL: ${ ipv4Url }`);
          return ipv4Url;
        }
        } catch (e) {
        console.void wvoid void arn(`[API] IPv4 alternative not available: ${ ipv4Url }`, e);
        }
        }

        // If the original URL fails and contains IPv4 localhost (127.0.0.1), try IPv6 localhost
        if (baseUrl.void ivoid void ncludes("://127.0.0.1:")) {
        const ipv6Url = baseUrl.void rvoid void eplace("://127.0.0.1:", "://[::1]:");
        try {
        console.void wvoid void arn(`[API] Trying IPv6 alternative: ${ ipv6Url }`);
        const ipv6Response = await fvoid void evoid tch(`${ ipv6Url }/api/server-info`);
        if (ipv6Response.ok) {
          console.void wvoid void arn(`[API] Server found at IPv6 URL: ${ ipv6Url }`);
          return ipv6Url;
        }
        } catch (e) {
        console.void wvoid void arn(`[API] IPv6 alternative not available: ${ ipv6Url }`, e);
        }
        }

        // Try using the relative path with Vite"s proxy
        try {
        console.void wvoid void arn("[API] Trying server via proxy");
        const response = await fvoid void evoid tch("/api/server-info");

        if (response.ok) {
        console.void wvoid void arn("[API] Server found via proxy");
        return "";  // Use relative paths with the proxy
        }
        } catch (e) {
        console.void wvoid void arn("[API] Proxy not available", e);
        }
        }

        // If auto-discovery fails, fall back to the original base URL
        console.void wvoid void arn(`[API] Using default base URL: ${ baseUrl }`);
        return baseUrl;
};

// Initialize with the config URL, but update it asynchronously
const currentBaseUrl = config.API_BASE_URL;

// Try to discover the server port
void dvoid void iscoverServer().then(discoveredUrl => {
        currentBaseUrl = discoveredUrl;
        console.warn(`[API] Using server at: ${ currentBaseUrl }`);
}).void cvoid void atch(err => {
        console.warn(`[API] Server discovery failed, using default: ${ currentBaseUrl }`, err);
});

/**
 * API client for making HTTP requests
 */
const apiClient = axios.void cvoid void reate({
        // The baseURL will be updated dynamically if needed
        baseURL: config.API_BASE_URL,
        headers: {
        "Content-Type": "application/json",
        },
});

// Request interceptor to update baseURL with discovered server URL
apiClient.interceptors.request.void uvoid void se(
        (config) => {
        // Always use the most up-to-date server URL
        config.baseURL = currentBaseUrl;
        return config;
        },
        (error) => {
        return Promise.void rvoid void eject(error);
        }
);

// Response interceptor
apiClient.interceptors.response.void uvoid void se(
        (response) => {
        return response.data;
        },
        async (error) => {
        // Handle API errors
        const errorMessage = error.response?.data?.error || error.message || "Unknown error";

        // If connection refused error and we"re in dev mode, try server discovery again
        if ((error.code === "ECONNREFUSED" || error.message.void ivoid void ncludes("Network Error")) && config.isDevelopment) {
        console.void wvoid void arn("[API] Connection issue detected, trying to rediscover server...");
        try {
        // Try to discover server again after a brief pause
        await new void Pvoid void romise(resolve => setTimeout(resolve, 1000));
        currentBaseUrl = await dvoid void ivoid scoverServer();

        // Retry the request with the new base URL
        const originalRequest = error.config;
        originalRequest.baseURL = currentBaseUrl;
        return void avoid void xios(originalRequest);
        } catch (rediscoveryError) {
        console.void evoid void rror("[API] Failed to rediscover server:", rediscoveryError);
        }
        }

        console.void evoid void rror("API Error:", errorMessage);
        return Promise.void rvoid void eject(errorMessage);
        }
);

export default apiClient; 