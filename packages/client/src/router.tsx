import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import { FeatureDemo } from "./components/FeatureDemo";

const theme = createTheme();

// Lazy load components
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Documentation = lazy(() => import("./pages/Documentation"));

// Create a router with future flags enabled
export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Box sx={{ 
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"
      }}>
        <Suspense fallback={
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <CircularProgress />
          </Box>
        }>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <FeatureDemo />
          </ThemeProvider>
        </Suspense>
      </Box>
    )
  },
  {
    path: '/home',
    element: (
      <Box sx={{ 
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh"
      }}>
        <Suspense fallback={
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <CircularProgress />
          </Box>
        }>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Home />
          </ThemeProvider>
        </Suspense>
      </Box>
    )
  },
  {
    path: '/products',
    element: (
      <Suspense fallback={<CircularProgress />}>
        <Products />
      </Suspense>
    )
  },
  {
    path: '/about',
    element: (
      <Suspense fallback={<CircularProgress />}>
        <About />
      </Suspense>
    )
  },
  {
    path: '/contact',
    element: (
      <Suspense fallback={<CircularProgress />}>
        <Contact />
      </Suspense>
    )
  },
  {
    path: '/docs',
    element: (
      <Suspense fallback={<CircularProgress />}>
        <Documentation />
      </Suspense>
    )
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
], {
  future: {
    v7_relativeSplatPath: true
  }
});

export default function Router() {
  return <RouterProvider router={router} />;
} 