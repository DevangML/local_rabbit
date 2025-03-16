// Pure vanilla JS SSR entry file - no JSX transpilation needed
import React from 'react';

/**
 * Simple server component that renders basic HTML
 */
function ServerComponent(props) {
  const { url = '/', message = 'Server rendered content' } = props || {};

  return React.createElement('div', { id: 'server-content', className: 'ssr-content' }, [
    React.createElement('h1', { key: 'heading' }, 'Server-Side Rendering'),
    React.createElement('p', { key: 'url' }, `Requested URL: ${url}`),
    React.createElement('p', { key: 'message' }, message),
    React.createElement('p', { key: 'info' }, 'This content is rendered on the server.')
  ]);
}

/**
 * Standalone function for regular rendering
 */
export function renderPage(url) {
  console.log('Custom renderPage called with URL:', url);
  return React.createElement(ServerComponent, { url, message: 'Static render' });
}

/**
 * Function specifically for streaming SSR
 */
export function renderToStream(url) {
  console.log('Custom renderToStream called with URL:', url);
  // Use createElement directly without JSX
  return React.createElement(ServerComponent, { url, message: 'Streamed render' });
}

/**
 * Placeholder for emotion CSS extraction
 */
export const extractCriticalToChunks = () => {
  return {
    html: '',
    styles: []
  };
};

/**
 * Placeholder for emotion CSS tags construction
 */
export const constructStyleTagsFromChunks = () => {
  return '';
};

/**
 * Default export for dynamic imports
 */
export default {
  renderPage,
  renderToStream,
  extractCriticalToChunks,
  constructStyleTagsFromChunks
}; 