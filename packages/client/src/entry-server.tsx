// Import React hooks initialization first
import './mui-patches/react-hooks-init';

// Import the emotion fix before any other imports
// This fixes Emotion initialization issues and MUI styled-engine compatibility
import './emotion-fix';
import { SafeRender, isServer } from './emotion-fix';

import React, { Suspense } from "react";
import { StaticRouter } from "react-router-dom/server";
import { Routes, Route } from "react-router-dom";
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';

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
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100px' 
  }}>
    <div>Loading...</div>
  </div>
);

// Error boundary component for SSR
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Error in component:', error);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again later.</div>;
    }

    return <SafeRender>{this.props.children}</SafeRender>;
  }
}

// Create simplified versions of components for SSR with Suspense
const Products = () => (
  <Suspense fallback={<LoadingFallback />}>
    <ErrorBoundary>
      <div>
        <h1>Products</h1>
        <p>This content is server-rendered with Suspense support.</p>
      </div>
    </ErrorBoundary>
  </Suspense>
);

const About = () => (
  <Suspense fallback={<LoadingFallback />}>
    <ErrorBoundary>
      <div>
        <h1>About</h1>
        <p>This content is server-rendered with Suspense support.</p>
      </div>
    </ErrorBoundary>
  </Suspense>
);

const Contact = () => (
  <Suspense fallback={<LoadingFallback />}>
    <ErrorBoundary>
      <div>
        <h1>Contact</h1>
        <p>This content is server-rendered with Suspense support.</p>
      </div>
    </ErrorBoundary>
  </Suspense>
);

const Documentation = () => (
  <Suspense fallback={<LoadingFallback />}>
    <ErrorBoundary>
      <div>
        <h1>Documentation</h1>
        <p>This content is server-rendered with Suspense support.</p>
      </div>
    </ErrorBoundary>
  </Suspense>
);

// Simplified placeholder for React19Features
const React19FeaturesPlaceholder = () => (
  <Suspense fallback={<LoadingFallback />}>
    <ErrorBoundary>
      <div>
        <h1>React 19 Features</h1>
        <p>This content will be client-rendered.</p>
      </div>
    </ErrorBoundary>
  </Suspense>
);

// SSR-specific App component with Suspense
function SSRApp() {
  return (
    <SafeRender>
      <CacheProvider value={cache}>
        <ErrorBoundary>
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
                  <ErrorBoundary>
                    <div>
                      <h1>404 - Not Found</h1>
                      <p>The requested page could not be found.</p>
                    </div>
                  </ErrorBoundary>
                </Suspense>
              } />
            </Routes>
          </div>
        </ErrorBoundary>
      </CacheProvider>
    </SafeRender>
  );
}

// Export the render function for server use with streaming support
export function renderPage(url: string) {
  try {
    return (
      <SafeRender>
        <StaticRouter location={url}>
          <SSRApp />
        </StaticRouter>
      </SafeRender>
    );
  } catch (error) {
    console.error('Error in renderPage:', error);
    return (
      <SafeRender>
        <StaticRouter location={url}>
          <div>Rendering error occurred. Check server logs.</div>
        </StaticRouter>
      </SafeRender>
    );
  }
}

// Export emotion cache and functions for server rendering
export { cache, extractCriticalToChunks, constructStyleTagsFromChunks };

// Export a function for streaming rendering that returns a React element
// not a rendering function or promise
export function renderToStream(url: string) {
  try {
    return (
      <SafeRender>
        <StaticRouter location={url}>
          <SSRApp />
        </StaticRouter>
      </SafeRender>
    );
  } catch (error) {
    console.error('Error in renderToStream:', error);
    // Return a simplified fallback component in case of error
    return (
      <SafeRender>
        <StaticRouter location={url}>
          <div>Rendering error occurred. Check server logs.</div>
        </StaticRouter>
      </SafeRender>
    );
  }
}

// Keep the default export for backward compatibility but ensure it returns a React element
export default function render(props: any) {
  try {
    const { url } = props;
    return (
      <SafeRender>
        <StaticRouter location={url}>
          <SSRApp />
        </StaticRouter>
      </SafeRender>
    );
  } catch (error) {
    console.error('Error in default render:', error);
    return (
      <SafeRender>
        <StaticRouter location={props.url || "/"}>
          <div>Rendering error occurred. Check server logs.</div>
        </StaticRouter>
      </SafeRender>
    );
  }
} 