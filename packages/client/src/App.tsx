import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { ErrorBoundary } from '@local-rabbit/shared';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { theme } from './theme';

const Home = React.lazy(() => import('./pages/Home'));

function Loading() {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      bgcolor={theme.palette.background.default}
    >
      <CircularProgress />
    </Box>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 