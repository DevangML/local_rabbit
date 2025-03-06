import React, { useState /* useEffect */ } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
// import { store } from './store';
// import AppRoutes from './routes';
// import config from './config';
import { lightTheme, darkTheme } from './theme';
import { ThemeProvider as MuiThemeProvider, CircularProgress, Box } from '@mui/material';
import { Routes, Route, Navigate, Suspense } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import { useTheme } from './contexts/ThemeContext';

// Lazy load route components
const Products = React.lazy(() => import('./components/Products/Products'));
const About = React.lazy(() => import('./components/About/About'));
const Contact = React.lazy(() => import('./components/Contact/Contact'));
const Documentation = React.lazy(() => import('./components/Documentation/Documentation'));
const DiffViewer = React.lazy(() => import('./components/DiffViewer/DiffViewerContainer'));
const ImpactView = React.lazy(() => import('./components/ImpactView/ImpactView'));
const QualityCheck = React.lazy(() => import('./components/QualityCheck/QualityCheck'));
const AIAnalyzer = React.lazy(() => import('./components/AIAnalyzer'));

// Loading component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px'
    }}
  >
    <CircularProgress />
  </Box>
);

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
    <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
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