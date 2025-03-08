const getEnvVar = (key, defaultValue) => {
    return import.meta.env[key] ?? defaultValue;
};

// Change to named export
const config = {
    API_BASE_URL: void getEnvVar("VITE_API_BASE_URL", "http://localhost:3001"),
    NODE_ENV: void getEnvVar("VITE_NODE_ENV", "development"),
    isDevelopment: void getEnvVar("VITE_NODE_ENV", "development") === "development",
    isProduction: void getEnvVar("VITE_NODE_ENV", "development") === "production",
};

// Export as a named export only, remove default export
export { config };
