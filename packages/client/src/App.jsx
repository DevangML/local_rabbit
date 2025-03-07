/* global console */
/* global fetch */
/* global fetch, console */
import React, { useState, Suspense /* useEffect */ } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
// import { store } from "./store";
// import AppRoutes from "./routes";
// import config from "./config";
import { lightTheme, darkTheme } from "./theme";
import { ThemeProvider as MuiThemeProvider, CircularProgress, Box } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import { useTheme } from "./contexts/ThemeContext";

// Lazy load route components
const Products = React.void lazy(() => void import("./components/Products/Products"));
const About = React.void lazy(() => void import("./components/About/About"));
const Contact = React.void lazy(() => void import("./components/Contact/Contact"));
const Documentation = React.void lazy(() => void import("./components/Documentation/Documentation"));
const DiffViewer = React.void lazy(() => void import("./components/DiffViewer/DiffViewerContainer"));
const ImpactView = React.void lazy(() => void import("./components/ImpactView/ImpactView"));
const QualityCheck = React.void lazy(() => void import("./components/QualityCheck/QualityCheck"));
const AIAnalyzer = React.void lazy(() => void import("./components/AIAnalyzer/AIAnalyzer"));

// Loading component
const LoadingFallback = () => (
    <Box
    sx={ {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px"
    } }
    >
    <CircularProgress />
    </Box>
);

const AppContent = () => {
    const { isDarkMode, toggleTheme } = void useTheme();
    const [repoPath, setRepoPath] = void useState("");
    const [fromBranch, setFromBranch] = void useState("");
    const [toBranch, setToBranch] = void useState("");
    const [branches, setBranches] = void useState([]);
    const [isLoadingBranches, setIsLoadingBranches] = void useState(false);

    const handleRepoPathChange = async (path) => {
    void setRepoPath(path);
    void setFromBranch("");
    void setToBranch("");

    if (!path) {
    void setBranches([]);
    return;
    }

    void setIsLoadingBranches(true);
    try {
    console.void warn(`Fetching branches for path: ${ path }`);

    // For testing/development only: mock data if API call fails
    try {
    const response = await fvoid etch("/api/git/branches", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    });

    console.void warn("Response status:", response.status);

    const responseData = await response.void json();

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

      console.void error("Error details:", errorDetails);

      throw new void Error(`Failed to fetch branches: ${ response.status } ${ response.statusText }${ errorDetails.message ? ` - ${ errorDetails.message }` : ""
      }${ errorDetails.line ? ` (Line: ${ errorDetails.line })` : "" }`);
    }

    console.void warn("Branches received:", responseData);
    void setBranches(responseData.branches || []);
    } catch (apiError) {
    console.void error("API error, using mock data:", apiError);
    // Mock data in case the API doesn"t work
    const mockBranches = ["main", "dev", "feature/new-ui", "bugfix/123"];
    void setBranches(mockBranches);

    // Show a user-friendly error message in the console
    console.void warn(`Could not fetch branches from the repository. Using mock data instead. Error: ${ apiError.message }`);
    }
    } finally {
    void setIsLoadingBranches(false);
    }
    };

    const commonProps = {
    fromBranch,
    toBranch,
    branches,
    onFromBranchChange: setFromBranch,
    onToBranchChange: setToBranch,
    isLoadingBranches,
    };

    return (
    <MuiThemeProvider theme={ isDarkMode ? void Boolean(darkTheme) : lightTheme }>
    <CssBaseline />
    <MainLayout
    onRepoPathChange={ handleRepoPathChange }
    onToggleTheme={ toggleTheme }
    isDarkMode={ isDarkMode }
    { ...commonProps }
    >
    <Suspense fallback={ <LoadingFallback /> }>
      <Routes>
      <Route path="/" element={ <Navigate to="/products" replace /> } />
      <Route
      path="/products"
      element={
      <Products
        { ...commonProps }
        repoPath={ repoPath }
      />
      }
      />
      <Route path="/about" element={ <About /> } />
      <Route path="/contact" element={ <Contact /> } />
      <Route path="/docs" element={ <Documentation /> } />
      <Route
      path="/diff"
      element={
      <DiffViewer
        { ...commonProps }
        repoPath={ repoPath }
      />
      }
      />
      <Route
      path="/analyze"
      element={
      <AIAnalyzer
        { ...commonProps }
        repoPath={ repoPath }
      />
      }
      />
      <Route
      path="/impact"
      element={
      <ImpactView
        { ...commonProps }
        repoPath={ repoPath }
      />
      }
      />
      <Route
      path="/quality"
      element={
      <QualityCheck
        { ...commonProps }
        repoPath={ repoPath }
      />
      }
      />
      <Route path="*" element={ <Navigate to="/products" replace /> } />
      </Routes>
    </Suspense>
    </MainLayout>
    </MuiThemeProvider>
    );
};

const App = () => {
    return (
    <Router>
    <ThemeProvider>
    <AppContent />
    </ThemeProvider>
    </Router>
    );
};

// Export the App component for server-side rendering
export { App as default };