import { createBrowserRouter } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import App from './App';

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

// Lazy load components
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Import React19Features directly for better SSR compatibility
import { React19Features } from "./components/React19Features";

// Create routes configuration
const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <div>Welcome to the home page</div>
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
        element: <Products />
      },
      {
        path: 'about',
        element: <About />
      },
      {
        path: 'contact',
        element: <Contact />
      },
      {
        path: 'docs',
        element: <Documentation />
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
const router = createBrowserRouter(routes);

// Export the router for use in main.jsx
export default router; 