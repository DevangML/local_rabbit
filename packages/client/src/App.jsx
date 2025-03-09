/* global console */
/* global fetch */
/* global console */
/* global fetch */
/* global console */
/* global fetch */
/* global fetch, console */
import React, { useState, Suspense, createContext, useContext, useEffect, Component } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// import { Provider } from "react-redux";
// import { BrowserRouter as Router } from "react-router-dom";
// import { store } from "./store";
// import AppRoutes from "./routes";
// import config from "./config";
import { lightTheme as customLightTheme, darkTheme as customDarkTheme } from "./theme";
import { CircularProgress, Box, Typography } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
// We'll implement our own theme context directly in this file
// import { useTheme } from "./contexts/ThemeContext";

// Error boundary to catch rendering errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          color: '#333',
          backgroundColor: '#f8f9fa',
          fontFamily: 'Arial, sans-serif',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h2>Something went wrong</h2>
          <p>Please refresh the page to try again.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: '#0366d6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback theme values if imports fail
const defaultLightTheme = {
  bgPrimary: "#ffffff",
  bgSecondary: "#f8f9fa",
  textPrimary: "#1a1a1a",
  textSecondary: "#6c757d",
  border: "#dee2e6",
  accent: "#0366d6",
  accentHover: "#0358c3",
  surface: "#ffffff",
  surfaceHover: "#f8f9fa"
};

const defaultDarkTheme = {
  bgPrimary: "#0d1117",
  bgSecondary: "#161b22",
  textPrimary: "#c9d1d9",
  textSecondary: "#8b949e",
  border: "#30363d",
  accent: "#58a6ff",
  accentHover: "#4d8ee3",
  surface: "#21262d",
  surfaceHover: "#30363d"
};

// Use imported themes or fallbacks if they don't exist
const lightTheme = customLightTheme || defaultLightTheme;
const darkTheme = customDarkTheme || defaultDarkTheme;

// Material UI theme creation
const createMuiTheme = (isLight) => {
  try {
    const baseTheme = isLight ? lightTheme : darkTheme;

    // Add debugging to check theme structure
    console.log("Theme being used:", isLight ? "light" : "dark", baseTheme);

    return createTheme({
      palette: {
        mode: isLight ? 'light' : 'dark',
        primary: {
          main: baseTheme?.accent || (isLight ? '#1976d2' : '#90caf9'),
        },
        secondary: {
          main: baseTheme?.accentHover || (isLight ? '#dc004e' : '#f48fb1'),
        },
        background: {
          default: baseTheme?.bgPrimary || (isLight ? '#ffffff' : '#121212'),
          paper: baseTheme?.bgSecondary || (isLight ? '#f5f5f5' : '#1e1e1e'),
        },
        text: {
          primary: baseTheme?.textPrimary || (isLight ? '#000000' : '#ffffff'),
          secondary: baseTheme?.textSecondary || (isLight ? '#00000099' : '#ffffff99'),
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: baseTheme?.bgPrimary || (isLight ? '#ffffff' : '#121212'),
              color: baseTheme?.textPrimary || (isLight ? '#000000' : '#ffffff'),
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating MUI theme:", error);
    // Return a minimal fallback theme
    return createTheme({
      palette: {
        mode: isLight ? 'light' : 'dark'
      }
    });
  }
};

// Create Material UI themes
let lightMuiTheme, darkMuiTheme;

try {
  lightMuiTheme = createMuiTheme(true);
  darkMuiTheme = createMuiTheme(false);
} catch (error) {
  console.error("Error initializing themes:", error);
  // Create minimal fallback themes
  lightMuiTheme = createTheme({ palette: { mode: 'light' } });
  darkMuiTheme = createTheme({ palette: { mode: 'dark' } });
}

// Create a theme context directly in this file to avoid any possible conflicts
const AppThemeContext = createContext();

const AppThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage?.getItem("theme");
      return savedTheme
        ? savedTheme === "dark"
        : window?.matchMedia?.("(prefers-color-scheme: dark)")?.matches || false;
    }
    return false; // Default to light theme for SSR
  });

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      localStorage?.setItem("theme", isDarkMode ? "dark" : "light");
      document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
      document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? darkMuiTheme : lightMuiTheme
  };

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={isDarkMode ? darkMuiTheme : lightMuiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
};

// Custom hook to use our theme context
const useAppTheme = () => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within an AppThemeProvider");
  }
  return context;
};

// Lazy load components only on the client side
const lazyWithSSR = (importFn) => {
  if (typeof window === 'undefined') {
    return () => <LoadingFallback />;
  }
  return React.lazy(importFn);
};

// Lazy load route components with SSR support
const Products = lazyWithSSR(() => import(/* webpackChunkName: "products" */ "./components/Products/Products"));
const About = lazyWithSSR(() => import(/* webpackChunkName: "about" */ "./components/About/About"));
const Contact = lazyWithSSR(() => import(/* webpackChunkName: "contact" */ "./components/Contact/Contact"));
const Documentation = lazyWithSSR(() => import(/* webpackChunkName: "docs" */ "./components/Documentation/Documentation"));
const DiffViewer = lazyWithSSR(() => import(/* webpackChunkName: "analysis-tools" */ "./components/DiffViewer/DiffViewerContainer"));
const ImpactView = lazyWithSSR(() => import(/* webpackChunkName: "analysis-tools" */ "./components/ImpactView/ImpactView"));
const QualityCheck = lazyWithSSR(() => import(/* webpackChunkName: "analysis-tools" */ "./components/QualityCheck/QualityCheck"));
const AIAnalyzer = lazyWithSSR(() => import(/* webpackChunkName: "analysis-tools" */ "./components/AIAnalyzer/AIAnalyzer"));

// Prefetch components only on the client side
const prefetchComponent = (importFn) => {
  if (typeof window === 'undefined') return () => { };
  return () => {
    importFn().catch(console.error);
  };
};

// Enhanced loading component with better UX
const LoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      gap: 2
    }}
  >
    <CircularProgress />
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
);

const AppContent = () => {
  const { isDarkMode, toggleTheme } = useAppTheme();
  const [repoPath, setRepoPath] = useState("");
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Prefetch on mount for frequently accessed routes
  useEffect(() => {
    prefetchComponent(() => import("./components/Products/Products"))();
    prefetchComponent(() => import("./components/DiffViewer/DiffViewerContainer"))();
  }, []);

  const handleRepoPathChange = async (path) => {
    setRepoPath(path);
    setFromBranch("");
    setToBranch("");

    if (!path) {
      setBranches([]);
      return;
    }

    setIsLoadingBranches(true);
    try {
      console.warn(`Fetching branches for path: ${path}`);

      // For testing/development only: mock data if API call fails
      try {
        const response = await fetch("/api/code-review/select-repository", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path }),
        });

        console.warn("Response status:", response.status);
        console.warn("Response headers:", Object.fromEntries([...response.headers]));

        // Check if the response is empty before trying to parse it
        const responseText = await response.text();
        if (!responseText) {
          throw new Error("Empty response from server");
        }

        // Check content type to handle HTML responses
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html")) {
          console.error("Received HTML response instead of JSON:", responseText.substring(0, 200) + "...");
          throw new Error("Server returned HTML instead of JSON. The server might be down or misconfigured.");
        }

        // Try to parse the JSON response
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse response as JSON:", responseText.substring(0, 200) + "...");
          throw new Error(`Invalid JSON response: ${parseError.message}`);
        }

        if (!response.ok) {
          // Extract detailed error information
          const errorDetails = {
            status: response.status,
            statusText: response.statusText,
            message: responseData.message || responseData.error || "Unknown error",
            line: responseData.line || "N/A",
            details: responseData.details || "",
            path: responseData.path || "",
          };

          console.error("Error details:", errorDetails);

          throw new Error(`Failed to fetch branches: ${response.status} ${response.statusText}${errorDetails.message ? ` - ${errorDetails.message}` : ""
            }${errorDetails.line ? ` (Line: ${errorDetails.line})` : ""}`);
        }

        console.warn("Branches received:", responseData);
        // Update to use the correct data structure from the server response
        const branchesArray = responseData.data && responseData.data.branches ? responseData.data.branches : [];
        setBranches(branchesArray);
      } catch (apiError) {
        console.error("API error, using mock data:", apiError);
        // Mock data in case the API doesn"t work
        const mockBranches = ["main", "dev", "feature/new-ui", "bugfix/123"];
        setBranches(mockBranches);

        // Show a user-friendly error message in the console
        console.warn(`Could not fetch branches from the repository. Using mock data instead. Error: ${apiError.message}`);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranches([]);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const commonProps = {
    branches,
    fromBranch,
    toBranch,
    onFromBranchChange: setFromBranch,
    onToBranchChange: setToBranch,
    isLoadingBranches
  };

  return (
    <MainLayout
      onRepoPathChange={handleRepoPathChange}
      onToggleTheme={toggleTheme}
      isDarkMode={isDarkMode}
      {...commonProps}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route
            path="/products"
            element={
              <Products
                {...commonProps}
                repoPath={repoPath}
              />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/docs" element={<Documentation />} />
          <Route
            path="/diff"
            element={
              <DiffViewer
                {...commonProps}
                repoPath={repoPath}
              />
            }
          />
          <Route
            path="/analyze"
            element={
              <AIAnalyzer
                {...commonProps}
                repoPath={repoPath}
              />
            }
          />
          <Route
            path="/impact"
            element={
              <ImpactView
                {...commonProps}
                repoPath={repoPath}
              />
            }
          />
          <Route
            path="/quality"
            element={
              <QualityCheck
                {...commonProps}
                repoPath={repoPath}
              />
            }
          />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AppThemeProvider>
        <AppContent />
      </AppThemeProvider>
    </ErrorBoundary>
  );
};

// Export the App component for server-side rendering
export { App as default };