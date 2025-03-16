import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';

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
  try {
    return (
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    );
  } catch (error) {
    console.error('Error in renderPage:', error);
    return <SimpleSSR />;
  }
}

// Export a function for non-streaming rendering
export function renderToStream(url) {
  return renderPage(url);
}

// Export placeholder functions for emotion integration
export const extractCriticalToChunks = (html) => ({ html, styles: [] });
export const constructStyleTagsFromChunks = (chunks) => '';

// Export default render function
export default function render(props) {
  return renderPage(props?.url || '/');
} 