import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import { API_BASE_URL } from './config';
import ProjectSelector from './components/ProjectSelector';
import DiffViewer from './components/DiffViewer';
import ReviewPanel from './components/ReviewPanel';
import AnalysisReport from './components/AnalysisReport';
import AIAnalyzer from './components/AIAnalyzer';
import ThemeToggle from './components/ThemeToggle';

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
    console.log('Selecting project:', dirInfo);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/set-repo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          name: dirInfo.name,
          samplePaths: dirInfo.samplePaths
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set repository');
      }
      
      const data = await response.json();
      console.log('Server response:', data);
      
      if (!data.branches || data.branches.length === 0) {
        throw new Error('No branches found in repository');
      }
      
      // Set repo info
      setRepoInfo(data);
      
      // Set default branches
      const defaultBranches = {
        from: data.branches[0],
        to: data.currentBranch || data.branches[0]
      };
      
      console.log('Setting default branches:', defaultBranches);
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
          toBranch: selectedBranches.to
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
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
    
    return (
      <nav className="app-nav">
        <div className="nav-container">
          <button 
            className="theme-toggle mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
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
          
          <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Diff View
              </Link>
            </li>
            <li>
              <Link 
                to="/impact" 
                className={location.pathname === '/impact' ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Impact Analysis
              </Link>
            </li>
            <li>
              <Link 
                to="/quality" 
                className={location.pathname === '/quality' ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Quality Check
              </Link>
            </li>
            <li>
              <Link 
                to="/review" 
                className={location.pathname === '/review' ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Review
              </Link>
            </li>
            <li>
              <Link 
                to="/ai-analysis" 
                className={location.pathname === '/ai-analysis' ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Analysis
              </Link>
            </li>
          </ul>
          
          <div className="nav-end">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    );
  };

  return (
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
          onSelectProject={handleProjectSelect}
          selectedBranches={selectedBranches}
          onBranchesChange={setSelectedBranches}
          isLoading={isLoading}
        />

        <Navigation />

        {error && (
          <div className="error-message" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {isLoading && !diffData && (
          <div className="loading-message" role="status">
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
                    <AnalysisReport 
                      diffData={diffData}
                      type="impact"
                      fromBranch={selectedBranches.from}
                      toBranch={selectedBranches.to}
                    />
                  } 
                />
                <Route 
                  path="/quality" 
                  element={
                    <AnalysisReport 
                      diffData={diffData}
                      type="quality"
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
  );
}

export default App;