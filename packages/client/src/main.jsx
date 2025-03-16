/* global document */
/* global document */
/* global document */
/* global document */
/* global window, document, console */
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.js"
import "./index.css"

// Check if we're in development and show SSR notice if needed
// But ensure the React application still renders
const isDev = import.meta.env.DEV;
if (isDev) {
    console.log("Development Mode - SSR is disabled in dev mode");
}

// Add fallback loading indicator function
const handleOnLoadFallback = () => {
    const rootElement = document.getElementById("root");
    const hasContent = rootElement && rootElement.childNodes.length > 0;
    if (!hasContent) {
        rootElement.innerHTML = "<div style='display:flex;justify-content:center;align-items:center;height:100vh;'><p>Loading application...</p></div>";
    }

    // Mark document as loaded
    document.body.classList.add('app-loaded');
};

// Router setup for the entire application
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

// Handle loading state
window.addEventListener('load', handleOnLoadFallback);
