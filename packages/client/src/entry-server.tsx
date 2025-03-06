import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route } from 'react-router-dom';
import { theme } from './theme.js';
import { FeatureDemo } from './components/FeatureDemo.ssr.jsx';

// Custom App component for SSR
function SSRApp(): JSX.Element {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<FeatureDemo />} />
          <Route path="/home" element={<div>Home Page</div>} />
        </Routes>
      </ThemeProvider>
    </Box>
  );
}

// Export a named renderPage function for server.ts to use instead
export function renderPage(url: string): JSX.Element {
  return (
    <StaticRouter location={url}>
      <SSRApp />
    </StaticRouter>
  );
}

interface RenderProps {
  url: string;
}

// Keep the default export for backward compatibility
export default function render(props: RenderProps): JSX.Element {
  const { url } = props;
  return renderPage(url);
} 