import React from "react";
import { StaticRouter } from "react-router-dom/server";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Routes, Route } from "react-router-dom";
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';

// Create the Emotion cache for SSR
const cache = createCache({
  key: 'css',
  prepend: true
});

// Create the Emotion server
const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);

// Create a minimal theme for SSR
const ssrTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

// Create simplified versions of components for SSR
const Products = () => (
  <div>
    <h1>Products</h1>
    <p>This content is server-rendered.</p>
  </div>
);

const About = () => (
  <div>
    <h1>About</h1>
    <p>This content is server-rendered.</p>
  </div>
);

const Contact = () => (
  <div>
    <h1>Contact</h1>
    <p>This content is server-rendered.</p>
  </div>
);

const Documentation = () => (
  <div>
    <h1>Documentation</h1>
    <p>This content is server-rendered.</p>
  </div>
);

// SSR-specific App component
function SSRApp() {
  return (
    <React.StrictMode>
      <CacheProvider value={cache}>
        <ThemeProvider theme={ssrTheme}>
          <CssBaseline />
          <div style={{ padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Products />} />
              <Route path="/products" element={<Products />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="*" element={
                <div>
                  <h1>404 - Not Found</h1>
                  <p>The requested page could not be found.</p>
                </div>
              } />
            </Routes>
          </div>
        </ThemeProvider>
      </CacheProvider>
    </React.StrictMode>
  );
}

// Export the render function for server use
export function renderPage(url: string) {
  return (
    <StaticRouter location={url}>
      <SSRApp />
    </StaticRouter>
  );
}

// Export the emotion cache and server utilities
export { cache, extractCriticalToChunks, constructStyleTagsFromChunks };

// Keep the default export for backward compatibility
export default function render(props: any) {
  // Use a safer way to access import.meta.env that works with TypeScript
  const { url, isDev = false } = props;
  
  // Try to determine if we're in dev mode
  let isDevMode = isDev;
  try {
    // @ts-ignore - This is a Vite-specific property that TypeScript might not recognize
    if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.DEV === 'boolean') {
      isDevMode = import.meta.env.DEV;
    }
  } catch (e) {
    // Ignore errors, fall back to the provided isDev value
  }
  
  return renderPage(url);
} 