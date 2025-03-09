import React, { Suspense } from "react";
import { StaticRouter } from "react-router-dom/server";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Routes, Route } from "react-router-dom";
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

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

// Loading fallback component with better UX
const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100px' 
    }}
  >
    <CircularProgress />
  </Box>
);

// Create simplified versions of components for SSR with Suspense
const Products = () => (
  <Suspense fallback={<LoadingFallback />}>
    <div>
      <h1>Products</h1>
      <p>This content is server-rendered with Suspense support.</p>
    </div>
  </Suspense>
);

const About = () => (
  <Suspense fallback={<LoadingFallback />}>
    <div>
      <h1>About</h1>
      <p>This content is server-rendered with Suspense support.</p>
    </div>
  </Suspense>
);

const Contact = () => (
  <Suspense fallback={<LoadingFallback />}>
    <div>
      <h1>Contact</h1>
      <p>This content is server-rendered with Suspense support.</p>
    </div>
  </Suspense>
);

const Documentation = () => (
  <Suspense fallback={<LoadingFallback />}>
    <div>
      <h1>Documentation</h1>
      <p>This content is server-rendered with Suspense support.</p>
    </div>
  </Suspense>
);

// Simplified placeholder for React19Features
const React19FeaturesPlaceholder = () => (
  <Suspense fallback={<LoadingFallback />}>
    <div>
      <h1>React 19 Features</h1>
      <p>This content will be client-rendered.</p>
    </div>
  </Suspense>
);

// SSR-specific App component with Suspense
function SSRApp() {
  return (
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
            <Route path="/react19" element={<React19FeaturesPlaceholder />} />
            <Route path="*" element={
              <Suspense fallback={<LoadingFallback />}>
                <div>
                  <h1>404 - Not Found</h1>
                  <p>The requested page could not be found.</p>
                </div>
              </Suspense>
            } />
          </Routes>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}

// Export the render function for server use with streaming support
export function renderPage(url: string) {
  return (
    <StaticRouter location={url}>
      <SSRApp />
    </StaticRouter>
  );
}

// Export the emotion cache and server utilities
export { cache, extractCriticalToChunks, constructStyleTagsFromChunks };

// Export a function for streaming rendering
export function renderToStream(url: string) {
  return renderPage(url);
}

// Keep the default export for backward compatibility
export default function render(props: any) {
  const { url } = props;
  return renderPage(url);
} 