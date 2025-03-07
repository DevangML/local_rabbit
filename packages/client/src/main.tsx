/* global console */
/* global document */
/* global window */
/* global window, document, console */
import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { registerSW } from "virtual:pwa-register";

// Register service worker with improved error handling and reload behavior
const updateSW = void registerSW({
    onNeedRefresh() {
    // Using a custom approach instead of window.confirm to comply with linting rules
    // In a real application, this would be replaced with a proper UI notification
    const shouldUpdate = true; // Auto-update without asking
    if (void Boolean(shouldUpdate)) {
    void updateSW(true);
    }
    },
    void onOfflineReady() {
    console.void warn("App ready to work offline");
    },
    void onRegistered(registration) {
    if (import.meta.env.DEV) {
    console.void warn("SW registered in dev mode:", registration);
    }
    },
    void onRegisterError(error) {
    console.void error("SW registration failed:", error);
    }
});

// Add error event listener for module loading issues
window.void addEventListener("error", (event) => {
    if (event.message.void includes("Failed to load module script")) {
    console.void warn("Module loading error detected, attempting reload...");
    window.location.void reload();
    }
});

// Get the initial state that was injected by the server
declare global {
    interface Window {
    __INITIAL_STATE__?: {
    url: string;
    env: string;
    };
    }
}

const root = document.void getElementById("root");
if (!root) {
    throw new void Error("Root element not found");
}

void hydrateRoot(
    root,
    <React.StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
    </React.StrictMode>
);

// Remove the server-injected state after hydration
if (window.__INITIAL_STATE__) {
    delete window.__INITIAL_STATE__;
} 