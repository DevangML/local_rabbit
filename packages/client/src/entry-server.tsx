import React, { Suspense } from "react";
import { StaticRouter } from "react-router-dom/server";
import { Routes, Route } from "react-router-dom";

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

// Create empty emotion server exports to maintain compatibility
export const cache = null;
export const extractCriticalToChunks = () => ({ html: '', styles: [] });
export const constructStyleTagsFromChunks = () => '';

// Export a function for streaming rendering
export function renderToStream(url: string) {
  return renderPage(url);
}

// Keep the default export for backward compatibility
export default function render(props: any) {
  const { url } = props;
  return renderPage(url);
} 