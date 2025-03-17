// Import the monkey patch script first
import './mui-patches/monkeyPatch';

// Patch useEnhancedEffect directly to avoid errors
// This needs to be done before any MUI imports
global.useEnhancedEffectPatched = true;

// Then import our patches
import './mui-patches/index';

// Import React hooks initialization file is no longer needed as it's handled by the patches
// import './mui-patches/react-hooks-init';

// Import the emotion fix before any other imports
// This fixes Emotion initialization issues and MUI styled-engine compatibility
import './emotion-fix.js';
import { SafeRender, isServer } from './emotion-fix.js';

// Make React available globally
import * as React from 'react';
global.React = React;

// Override React.useLayoutEffect to avoid SSR warnings
if (typeof window === 'undefined') {
  React.useLayoutEffect = React.useEffect;
}

import { Suspense } from "react";
import { StaticRouter } from "react-router-dom/server";
import { Routes, Route } from "react-router-dom";
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
// Use require-style imports for MUI to avoid ESM issues in SSR
import * as styles from '@mui/material/styles/index.js';
const { createTheme, ThemeProvider } = styles;
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Import components needed for SSR
import { Navigation } from './components/Navigation.jsx';

// Create a theme instance for server rendering
const theme = createTheme();

// Create a server-side emotion cache with a namespace
// For SSR, we need to handle the absence of document
const cache = createCache({
  key: 'css',
  prepend: true, // This ensures styles are prepended to the <head> for SSR
  // Don't specify insertionPoint in SSR environment to avoid document references
  ...(!isServer ? { insertionPoint: document.head } : {})
});

// Create emotion server
const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);

// Simple loading fallback
const LoadingFallback = () => (
  <SafeRender>
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100px'
    }}>
      <div>Loading...</div>
    </div>
  </SafeRender>
);

// Error boundary component for SSR
class ErrorBoundary extends React.Component {
  // Define props interface
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // Define state type
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Error in component:', error);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again later.</div>;
    }

    return <SafeRender>{this.props.children}</SafeRender>;
  }
}

// Products component
const Products = () => (
  <SafeRender>
    <div>
      <h1>Products</h1>
      <p>This is the products page rendered via SSR.</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <p>Sample products would be listed here.</p>
      </div>
    </div>
  </SafeRender>
);

// About component
const About = () => (
  <SafeRender>
    <div>
      <h1>About</h1>
      <p>This is the about page rendered via SSR.</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <p>About page content rendered from the server.</p>
      </div>
    </div>
  </SafeRender>
);

// Contact component
const Contact = () => (
  <SafeRender>
    <div>
      <h1>Contact</h1>
      <p>This is the contact page rendered via SSR.</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <p>Contact information would be displayed here.</p>
      </div>
    </div>
  </SafeRender>
);

// Documentation component
const Documentation = () => (
  <SafeRender>
    <div>
      <h1>Documentation</h1>
      <p>This is the documentation page rendered via SSR.</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <p>Documentation content would be displayed here.</p>
      </div>
    </div>
  </SafeRender>
);

// React19 Features Placeholder
const React19FeaturesPlaceholder = () => (
  <SafeRender>
    <div>
      <h1>React 19 Features</h1>
      <p>This is a placeholder for React 19 features page.</p>
      <p>The actual implementation will be loaded client-side.</p>
    </div>
  </SafeRender>
);

// SSR-specific App component with Suspense
function SSRApp() {
  return (
    <SafeRender>
      <CacheProvider value={cache}>
        <ErrorBoundary>
          <div style={{ padding: '20px' }}>
            <Routes>
              <Route path="/" element={<SafeRender><Products /></SafeRender>} />
              <Route path="/products" element={<SafeRender><Products /></SafeRender>} />
              <Route path="/about" element={<SafeRender><About /></SafeRender>} />
              <Route path="/contact" element={<SafeRender><Contact /></SafeRender>} />
              <Route path="/docs" element={<SafeRender><Documentation /></SafeRender>} />
              <Route path="/react19" element={<SafeRender><React19FeaturesPlaceholder /></SafeRender>} />
              <Route path="*" element={
                <SafeRender>
                  <Suspense fallback={<LoadingFallback />}>
                    <ErrorBoundary>
                      <div>
                        <h1>404 - Not Found</h1>
                        <p>The requested page could not be found.</p>
                      </div>
                    </ErrorBoundary>
                  </Suspense>
                </SafeRender>
              } />
            </Routes>
          </div>
        </ErrorBoundary>
      </CacheProvider>
    </SafeRender>
  );
}

// Export the render function for server use with streaming support
export function renderPage(url) {
  try {
    return (
      <SafeRender>
        <React.StrictMode>
          <StaticRouter location={url}>
            <SSRApp />
          </StaticRouter>
        </React.StrictMode>
      </SafeRender>
    );
  } catch (error) {
    console.error('Error in renderPage:', error);
    return (
      <SafeRender>
        <div style={{ padding: '20px', border: '1px solid red', margin: '20px', background: '#fff8f8' }}>
          <h2 style={{ color: 'red' }}>Rendering Error</h2>
          <p>An error occurred while rendering this page. Please check the server logs for details.</p>
          <p>{error instanceof Error ? error.message : String(error)}</p>
        </div>
      </SafeRender>
    );
  }
}

// Export emotion cache and functions for server rendering
export { cache, extractCriticalToChunks, constructStyleTagsFromChunks };

// Export a function for non-streaming rendering that returns a React element
// This version disables Suspense streaming to avoid SSR issues
export function renderToStream(url) {
  try {
    // Create a non-streaming version that renders everything synchronously
    return (
      <SafeRender>
        <React.StrictMode>
          <StaticRouter location={url}>
            {/* Use a simplified version that doesn't use Suspense for SSR */}
            <ErrorBoundary>
              <CacheProvider value={cache}>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  {/* Simple static content without Suspense */}
                  <Navigation />
                  <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Products /> {/* Static content as fallback */}
                  </Box>
                </ThemeProvider>
              </CacheProvider>
            </ErrorBoundary>
          </StaticRouter>
        </React.StrictMode>
      </SafeRender>
    );
  } catch (error) {
    console.error('Error in renderToStream:', error);
    return (
      <SafeRender>
        <div style={{ padding: '20px', border: '1px solid red', margin: '20px', background: '#fff8f8' }}>
          <h2 style={{ color: 'red' }}>Streaming Rendering Error</h2>
          <p>An error occurred while rendering this page. Please check the server logs for details.</p>
          <p>{error instanceof Error ? error.message : String(error)}</p>
        </div>
      </SafeRender>
    );
  }
}

// Make sure renderPage is included in the default export
const serverExports = {
  renderPage,
  renderToStream,
  cache,
  extractCriticalToChunks,
  constructStyleTagsFromChunks
};

// Export default that includes all named exports
export default serverExports;