import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { Routes, Route } from 'react-router-dom';

// Create a simplified SSR App without MUI components to avoid import issues
function SSRApp() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Routes>
        <Route path="/" element={<div>Welcome to Local Rabbit</div>} />
        <Route path="/home" element={<div>Home Page</div>} />
      </Routes>
    </div>
  );
}

// Export a named renderPage function for server.ts to use
export function renderPage(url) {
  return (
    <StaticRouter location={url}>
      <SSRApp />
    </StaticRouter>
  );
}

// Keep the default export for backward compatibility
export default function render(props) {
  const { url } = props;
  return renderPage(url);
} 