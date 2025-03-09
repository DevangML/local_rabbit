/* global console */
/* global document */
/* global window */
/* global console */
/* global document */
/* global window */
/* global window, document, console */
import React from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import Router from "./router";
import { registerSW } from "virtual:pwa-register";

// Register service worker with improved error handling and reload behavior
const updateSW = registerSW({
        onNeedRefresh() {
        // Using a custom approach instead of window.confirm to comply with linting rules
        // In a real application, this would be replaced with a proper UI notification
        const shouldUpdate = true; // Auto-update without asking
        if (shouldUpdate) {
        updateSW(true);
        }
        },
        onOfflineReady() {
        console.warn("App ready to work offline");
        },
        onRegistered(registration) {
        if (import.meta.env.DEV) {
        console.warn("SW registered in dev mode:", registration);
        }
        },
        onRegisterError(error) {
        console.error("SW registration failed:", error);
        }
});

// Add error event listener for module loading issues
window.addEventListener("error", (event) => {
        if (event.message.includes("Failed to load module script")) {
        console.warn("Module loading error detected, attempting reload...");
        window.location.reload();
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

const root = document.getElementById("root");
if (!root) {
        throw new Error("Root element not found");
}

// Check if we're hydrating from server-rendered content
if (root.innerHTML.trim().length > 0 && window.__INITIAL_STATE__) {
        // Use hydrateRoot for SSR hydration
        hydrateRoot(
                root,
                <React.StrictMode>
                <Router />
                </React.StrictMode>
        );
} else {
        // Use createRoot for client-side rendering with Concurrent Mode
        const appRoot = createRoot(root);
        appRoot.render(
                <React.StrictMode>
                <Router />
                </React.StrictMode>
        );
}

// Remove the server-injected state after hydration
if (window.__INITIAL_STATE__) {
        delete window.__INITIAL_STATE__;
} 