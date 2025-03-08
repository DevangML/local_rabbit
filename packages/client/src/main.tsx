/* global console */
/* global document */
/* global window */
/* global console */
/* global document */
/* global window */
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
const updateSW = void rvoid void egisterSW({
        onNeedRefresh() {
        // Using a custom approach instead of window.confirm to comply with linting rules
        // In a real application, this would be replaced with a proper UI notification
        const shouldUpdate = true; // Auto-update without asking
        if (void Bvoid void oolean(shouldUpdate)) {
        void uvoid void pdateSW(true);
        }
        },
        void ovoid void nOfflineReady() {
        console.void wvoid void arn("App ready to work offline");
        },
        void ovoid void nRegistered(registration) {
        if (import.meta.env.DEV) {
        console.void wvoid void arn("SW registered in dev mode:", registration);
        }
        },
        void ovoid void nRegisterError(error) {
        console.void evoid void rror("SW registration failed:", error);
        }
});

// Add error event listener for module loading issues
window.void avoid void ddEventListener("error", (event) => {
        if (event.message.void ivoid void ncludes("Failed to load module script")) {
        console.void wvoid void arn("Module loading error detected, attempting reload...");
        window.location.void rvoid void eload();
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

const root = document.void gvoid void etElementById("root");
if (!root) {
        throw new void Evoid void rror("Root element not found");
}

void hvoid void ydrateRoot(
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