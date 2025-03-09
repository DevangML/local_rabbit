import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import App from './App';

// Import components directly first to check if they need to be converted to default exports
import { FeatureDemo } from "./components/FeatureDemo";
import { React19Features } from "./components/React19Features";

// Loading fallback component with better UX
const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}
  >
    <CircularProgress />
  </Box>
);

// Lazy load all components for code splitting
const FeatureDemo = lazy(() => import("./components/FeatureDemo"));
const React19Features = lazy(() => import("./components/React19Features").then(module => ({ default: module.React19Features })));
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Create placeholder components for pages that might not exist yet
const Products = () => (
  <div>
    <h1>Products</h1>
    <p>This is the products page.</p>
  </div>
);

const About = () => (
  <div>
    <h1>About</h1>
    <p>This is the about page.</p>
  </div>
);

const Contact = () => (
  <div>
    <h1>Contact</h1>
    <p>This is the contact page.</p>
  </div>
);

const Documentation = () => (
  <div>
    <h1>Documentation</h1>
    <p>This is the documentation page.</p>
  </div>
);

const theme = createTheme();

// Create routes configuration
const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <FeatureDemo />
          </Suspense>
        )
      },
      {
        path: 'home',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Home />
          </Suspense>
        )
      },
      {
        path: 'react19',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <React19Features />
          </Suspense>
        )
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Products />
          </Suspense>
        )
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <About />
          </Suspense>
        )
      },
      {
        path: 'contact',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Contact />
          </Suspense>
        )
      },
      {
        path: 'docs',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Documentation />
          </Suspense>
        )
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFound />
          </Suspense>
        )
      }
    ]
  }
];

// Create the router with React 19 features enabled
const router = createBrowserRouter(routes, {
  future: {
    v7_relativeSplatPath: true
  }
});

// Main Router component
function Router() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default Router; 