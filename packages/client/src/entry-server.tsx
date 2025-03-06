// @ts-nocheck
import React from 'react';
import App from './App';
import { StaticRouter } from 'react-router-dom/server';

// Export a named renderPage function for server.ts to use instead
export function renderPage(url) {
  return (
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );
}

// Keep the default export for backward compatibility
export default function render(props) {
  const { url } = props;
  return renderPage(url);
} 