import React, { useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Products from './components/Products/Products';
import About from './components/About/About';
import Contact from './components/Contact/Contact';
import Documentation from './components/Documentation/Documentation';
import DiffViewerContainer from './components/DiffViewer/DiffViewerContainer';
import AIAnalyzer from './components/AIAnalyzer';
import ImpactView from './components/ImpactView/ImpactView';
import QualityCheck from './components/QualityCheck/QualityCheck';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import getTheme from './theme/lunarTheme';
import config from './config';

const AppContent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [repoPath, setRepoPath] = useState('');
  const [fromBranch, setFromBranch] = useState('');
  const [toBranch, setToBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  const handleRepoPathChange = async (path) => {
    setRepoPath(path);
    setFromBranch('');
    setToBranch('');

    if (!path) {
      setBranches([]);
      return;
    }

    setIsLoadingBranches(true);
    try {
      console.log(`Fetching branches for path: ${path}`);

      // For testing/development only: mock data if API call fails
      try {
        const response = await fetch('/api/git/branches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path }),
        });

        console.log('Response status:', response.status);

        const responseData = await response.json();

        if (!response.ok) {
          // Extract detailed error information
          const errorDetails = {
            status: response.status,
            statusText: response.statusText,
            message: responseData.message || responseData.error || 'Unknown error',
            line: responseData.line || 'N/A',
            details: responseData.details || '',
            path: responseData.path || '',
          };

          console.error('Error details:', errorDetails);

          throw new Error(`Failed to fetch branches: ${response.status} ${response.statusText}${errorDetails.message ? ` - ${errorDetails.message}` : ''
            }${errorDetails.line ? ` (Line: ${errorDetails.line})` : ''}`);
        }

        console.log('Branches received:', responseData);
        setBranches(responseData.branches || []);
      } catch (apiError) {
        console.error('API error, using mock data:', apiError);
        // Mock data in case the API doesn't work
        const mockBranches = ['main', 'dev', 'feature/new-ui', 'bugfix/123'];
        setBranches(mockBranches);

        // Show a user-friendly error message in the console
        console.warn(`Could not fetch branches from the repository. Using mock data instead. Error: ${apiError.message}`);
      }
    } finally {
      setIsLoadingBranches(false);
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
    <MuiThemeProvider theme={getTheme(isDarkMode ? 'dark' : 'light')}>
      <CssBaseline />
      <MainLayout
        onRepoPathChange={handleRepoPathChange}
        onToggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        {...commonProps}
      >
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
              <DiffViewerContainer
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

export default App;