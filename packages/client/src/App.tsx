import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress } from '@mui/material';
import { ErrorBoundary } from '@local-rabbit/shared';
import { theme } from './theme';

// Loading component
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </div>
);

// Lazy load components
const Home = () => (
  <div>
    <h1>Welcome to Local Rabbit</h1>
    <p>A modern monorepo with SSR support</p>
  </div>
);

export default function App() {
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