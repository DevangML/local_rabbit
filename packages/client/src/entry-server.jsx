import React from 'react';

// Simple component for SSR
const SimpleSSR = () => {
  return (
    <div>
      <h1>Server-Side Rendered Content</h1>
      <p>This is a minimal SSR implementation to avoid initialization errors.</p>
    </div>
  );
};

// Export the render function for server use
export function renderPage(url) {
  return <SimpleSSR />;
}

// Export a function for non-streaming rendering
export function renderToStream(url) {
  return <SimpleSSR />;
}

// Export default render function
export default function render(props) {
  return <SimpleSSR />;
} 