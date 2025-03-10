const getEnvVar = (key, defaultValue) => {
        const value = import.meta.env[key];
        return value !== undefined ? Boolean(value) : defaultValue;
};

// Using Vite environment variables for frontend
const config = {
        apiBaseUrl: process.env.REACT_APP_API_URL || "http://localhost:3001",
        FALLBACK_API_ROUTE: "/api/git/repository/branches",
        NODE_ENV: getEnvVar("VITE_NODE_ENV", "development"),
        isDevelopment: getEnvVar("VITE_NODE_ENV", "development") === "development",
        isProduction: getEnvVar("VITE_NODE_ENV", "development") === "production",
};

// Also provide individual exports for convenience
export const {
        apiBaseUrl,
        NODE_ENV,
        isDevelopment,
        isProduction
} = config;

export default config;