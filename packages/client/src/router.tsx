import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import App from './App';
import { FeatureDemo } from "./components/FeatureDemo";
import { React19Features } from "./components/React19Features";

const theme = createTheme();

// Lazy load components
const Home = lazy(() => import("./pages/Home"));

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

// Create a router with future flags enabled
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <FeatureDemo />
      },
      {
        path: 'home',
        element: (
          <Suspense fallback={<CircularProgress />}>
            <Home />
          </Suspense>
        )
      },
      {
        path: 'react19',
        element: <React19Features />
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
          <div>
            <h1>404 - Not Found</h1>
            <p>The requested page could not be found.</p>
          </div>
        )
      }
    ]
  }
], {
  future: {
    v7_relativeSplatPath: true
  }
});

export default function Router() {
  return <RouterProvider router={router} />;
} 