import React from "react";
import { StaticRouter } from "react-router-dom/server";
import { Routes, Route } from "react-router-dom";

// Create a simplified SSR App without MUI components to avoid import issues
function SSRApp() {
  return (
    <div 
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        lineHeight: "1.5"
      }}
    >
      <header style={{ marginBottom: "20px" }}>
        <h1 style={{ marginBottom: "10px" }}>Local Rabbit</h1>
      </header>
        
      <main>
        <Routes>
          <Route path="/" element={
            <div>
              <h2>Welcome to Local Rabbit</h2>
              <p>This is the server-rendered version of the application.</p>
            </div>
          } />
          <Route path="/home" element={
            <div>
              <h2>Home Page</h2>
              <p>Server-rendered content for the home page.</p>
            </div>
          } />
          <Route path="*" element={
            <div>
              <h2>Page Not Found</h2>
              <p>The requested page could not be found.</p>
            </div>
          } />
        </Routes>
      </main>
      
      <footer style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid #eaeaea" }}>
        <p><small>© {new Date().getFullYear()} Local Rabbit. All rights reserved.</small></p>
      </footer>
    </div>
  );
}

// Add a development mode message that will only be displayed when SSR is in development mode
function DevModeMessage() {
  return (
    <div
      id="ssr-dev-mode-message"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "#333",
        color: "white",
        padding: "10px 15px",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        zIndex: 9999,
        fontSize: "14px",
        maxWidth: "300px"
      }}
    >
      <strong>Development Mode</strong>
      <p style={{ margin: "5px 0 0" }}>
        SSR is disabled in dev mode. Build with 'npm run build:ssr' for full SSR.
      </p>
    </div>
  );
}

// Export a named renderPage function for server.ts to use
export function renderPage(url: string, isDev: boolean = false) {
  return (
    <StaticRouter location={url}>
      <SSRApp />
      {isDev && <DevModeMessage />}
    </StaticRouter>
  );
}

// Keep the default export for backward compatibility
export default function render(props: any) {
  const { url, isDev = import.meta.env.DEV } = props;
  return renderPage(url, isDev);
} 