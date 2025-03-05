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

  // Persist repoInfo changes
  useEffect(() => {
    if (repoInfo) {
      localStorage.setItem(STORAGE_KEYS.REPO_INFO, JSON.stringify(repoInfo));
    } else {
      localStorage.removeItem(STORAGE_KEYS.REPO_INFO);
    }
  }, [repoInfo]);

  // Persist selectedBranches changes
  useEffect(() => {
    if (selectedBranches.from || selectedBranches.to) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCHES, JSON.stringify(selectedBranches));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCHES);
    }
  }, [selectedBranches]);

  const handleProjectSelect = async (dirInfo) => {
    setError(null);
    setIsLoading(true);
    console.info('Selecting project:', dirInfo);

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

    } catch (error) {
      console.error('Error in handleProjectSelect:', error);
      setError(error.message);
      setRepoInfo(null);
      setSelectedBranches({ from: '', to: '' });
      // Clear localStorage on error
      localStorage.removeItem(STORAGE_KEYS.REPO_INFO);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_BRANCHES);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDiffData = useCallback(async () => {
    if (!selectedBranches.from || !selectedBranches.to) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/diff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromBranch: selectedBranches.from,
          toBranch: selectedBranches.to,
        }),
      });

      if (!response || !response.ok) {
        const errorData = response ? await response.json().catch(() => ({ error: 'Unknown error' })) : { error: 'No response received' };
        throw new Error(errorData.error || 'Failed to fetch diff');
      }

      const data = await response.json();
      setDiffData(data);
    } catch (error) {
      console.error('Error fetching diff:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranches]);

  useEffect(() => {
    if (selectedBranches.from && selectedBranches.to) {
      fetchDiffData();
    }
  }, [selectedBranches, fetchDiffData]);

  // Update navigation component to use Link and handle active state
  const Navigation = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
      <nav className="app-nav">
        <div className="nav-container">
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            data-testid="mobile-menu-button"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>

          <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}
            data-testid="mobile-menu">
            <li>
              <Link
                to="/"
                className={location.pathname === '/' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Diff View
              </Link>
            </li>
            <li>
              <Link
                to="/impact"
                className={location.pathname === '/impact' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Impact Analysis
              </Link>
            </li>
            <li>
              <Link
                to="/quality"
                className={location.pathname === '/quality' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Quality Check
              </Link>
            </li>
            <li>
              <Link
                to="/review"
                className={location.pathname === '/review' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Review
              </Link>
            </li>
            <li>
              <Link
                to="/ai-analysis"
                className={location.pathname === '/ai-analysis' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                AI Analysis
              </Link>
            </li>
          </ul>

          <div className="nav-end">
            <ThemeSelector />
            <ThemeToggle />
          </div>
        </div>
      </nav>
    );
  };

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingIndicator />} persistor={persistor}>
        <ErrorBoundary>
          <ThemeProvider>
            <Suspense fallback={<LoadingIndicator />}>
              <Router>
                <div className="app">
                  <header className="app-header">
                    <div className="header-content">
                      <div className="logo">
                        <span className="logo-icon">🐰</span>
                        <h1>Local CodeRabbit</h1>
                      </div>
                      <p className="header-subtitle">PR Review Tool for Local Git Repositories</p>
                    </div>
                  </header>

                  <ProjectSelector
                    repoInfo={repoInfo}
                    onProjectSelect={handleProjectSelect}
                    selectedBranches={selectedBranches}
                    onBranchesChange={setSelectedBranches}
                    isLoading={isLoading}
                  />

                  <Navigation />

                  {error && (
                    <div className="error-message" role="alert" data-testid="error-message">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12" y2="16" />
                      </svg>
                      {error}
                    </div>
                  )}

                  {isLoading && !diffData && (
                    <div className="loading-message" role="status" data-testid="loading-indicator">
                      <div className="loading-spinner" aria-hidden="true"></div>
                      Loading repository information...
                    </div>
                  )}

                  {repoInfo && (
                    <main className="app-main">
                      <div className="content-container">
                        <Routes>
                          <Route
                            path="/"
                            element={
                              <DiffViewer
                                diffData={diffData}
                                isLoading={isLoading}
                                fromBranch={selectedBranches.from}
                                toBranch={selectedBranches.to}
                              />
                            }
                          />
                          <Route
                            path="/impact"
                            element={
                              <ImpactView
                                diffData={diffData}
                                fromBranch={selectedBranches.from}
                                toBranch={selectedBranches.to}
                              />
                            }
                          />
                          <Route
                            path="/quality"
                            element={
                              <QualityView
                                diffData={diffData}
                                fromBranch={selectedBranches.from}
                                toBranch={selectedBranches.to}
                              />
                            }
                          />
                          <Route
                            path="/review"
                            element={
                              <ReviewPanel
                                diffData={diffData}
                                fromBranch={selectedBranches.from}
                                toBranch={selectedBranches.to}
                              />
                            }
                          />
                          <Route
                            path="/ai-analysis"
                            element={
                              <AIAnalyzer
                                diffData={diffData}
                                fromBranch={selectedBranches.from}
                                toBranch={selectedBranches.to}
                              />
                            }
                          />
                        </Routes>
                      </div>
                    </main>
                  )}
                </div>
              </Router>
            </Suspense>
          </ThemeProvider>
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  );
}

export default App;