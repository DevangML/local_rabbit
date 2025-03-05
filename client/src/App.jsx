import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingIndicator from './components/LoadingIndicator';
import './App.css';
import './styles/global.css';
import { API_BASE_URL } from './config';
import ProjectSelector from './components/ProjectSelector';
import ReviewPanel from './components/ReviewPanel';
import AIAnalyzer from './components/AIAnalyzer';
import ThemeToggle from './components/ThemeToggle';
import ThemeSelector from './components/ThemeSelector';
import { useSelector } from 'react-redux';

// Route components
const DiffViewer = React.lazy(() => import('./components/DiffViewer'));
const ImpactView = React.lazy(() => import('./components/ImpactView'));
const QualityView = React.lazy(() => import('./components/QualityView'));

// Constants for localStorage keys
const STORAGE_KEYS = {
  REPO_INFO: 'localCodeRabbit_repoInfo',
  SELECTED_BRANCHES: 'localCodeRabbit_selectedBranches',
  VIEW_MODE: 'localCodeRabbit_viewMode'
};

function App() {
  // Initialize state with persisted data
  const [repoInfo, setRepoInfo] = useState(() => {
    const savedRepo = localStorage.getItem(STORAGE_KEYS.REPO_INFO);
    return savedRepo ? JSON.parse(savedRepo) : null;
  });

  const [selectedBranches, setSelectedBranches] = useState(() => {
    const savedBranches = localStorage.getItem(STORAGE_KEYS.SELECTED_BRANCHES);
    return savedBranches ? JSON.parse(savedBranches) : { from: '', to: '' };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentTheme } = useSelector(state => state.theme);

  // Persist repoInfo changes
  useEffect(() => {
    if (repoInfo) {
      localStorage.setItem(STORAGE_KEYS.REPO_INFO, JSON.stringify(repoInfo));
    }
  }, [repoInfo]);

  // Persist selectedBranches changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCHES, JSON.stringify(selectedBranches));
  }, [selectedBranches]);

  // Handle project selection
  const handleProjectSelect = async (dirInfo) => {
    console.info('Selecting project:', dirInfo);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/git/repository/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          path: dirInfo.path
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set repository');
      }

      const data = await response.json();
      console.info('Server response:', data);

      if (!data.branches || data.branches.length === 0) {
        throw new Error('No branches found in repository');
      }

      // Set repo info
      setRepoInfo(data);

      // Set default branches
      const defaultBranches = {
        from: data.branches[0],
        to: data.current || data.branches[0]
      };
      console.info('Setting default branches:', defaultBranches);
      setSelectedBranches(defaultBranches);

      // Clear any previous errors
      setError(null);
    } catch (err) {
      console.error('Error in handleProjectSelect:', err);
      setError(err.message);
      setRepoInfo(null);
      setSelectedBranches({ from: '', to: '' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle branch selection
  const handleBranchesChange = useCallback(({ from, to }) => {
    setSelectedBranches({ from, to });
  }, []);

  // Fetch diff data when branches change
  useEffect(() => {
    const fetchDiff = async () => {
      if (!selectedBranches.from || !selectedBranches.to) {
        setDiffData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/git/diff?from=${selectedBranches.from}&to=${selectedBranches.to}`);

        if (!response.ok) {
          throw new Error('Failed to fetch diff');
        }

        const data = await response.json();
        setDiffData(data);
      } catch (err) {
        console.error('Error fetching diff:', err);
        setError(err.message);
        setDiffData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiff();
  }, [selectedBranches]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    console.log('Mobile menu state before:', isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
    console.log('Mobile menu state after:', !isMobileMenuOpen);
  };

  useEffect(() => {
    // Apply theme colors when theme changes
    if (currentTheme && currentTheme.colors) {
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
    }
  }, [currentTheme]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.nav-links') && !event.target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-container">
              <Link to="/" className="logo">
                Local Rabbit
              </Link>
            </div>

            <button
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="menu-icon"></span>
            </button>

            <nav className={`nav-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
              <ul className="nav-links">
                <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Diff</Link></li>
                <li><Link to="/impact" onClick={() => setIsMobileMenuOpen(false)}>Impact</Link></li>
                <li><Link to="/quality" onClick={() => setIsMobileMenuOpen(false)}>Quality</Link></li>
              </ul>
              <div className="theme-controls">
                <ThemeToggle />
                <ThemeSelector />
              </div>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            <div className="project-selector-container">
              <ProjectSelector
                onProjectSelect={handleProjectSelect}
                onBranchesChange={handleBranchesChange}
                selectedBranches={selectedBranches}
                repoInfo={repoInfo}
                isLoading={isLoading}
                error={error}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <ErrorBoundary>
              <Suspense fallback={<LoadingIndicator />}>
                <Routes>
                  <Route path="/" element={
                    <DiffViewer
                      fromBranch={selectedBranches.from}
                      toBranch={selectedBranches.to}
                      diffData={diffData}
                      isLoading={isLoading}
                    />
                  } />
                  <Route path="/impact" element={
                    <ImpactView
                      fromBranch={selectedBranches.from}
                      toBranch={selectedBranches.to}
                      diffData={diffData}
                      isLoading={isLoading}
                    />
                  } />
                  <Route path="/quality" element={
                    <QualityView
                      fromBranch={selectedBranches.from}
                      toBranch={selectedBranches.to}
                      diffData={diffData}
                      isLoading={isLoading}
                    />
                  } />
                </Routes>
              </Suspense>
            </ErrorBoundary>

            <ReviewPanel />
            <AIAnalyzer />
          </div>
        </main>

        <footer className="app-footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} Local Rabbit. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default function AppWrapper() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}