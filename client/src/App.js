import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import { API_BASE_URL } from './config';
import ProjectSelector from './components/ProjectSelector';
import DiffViewer from './components/DiffViewer';
import ReviewPanel from './components/ReviewPanel';
import AnalysisReport from './components/AnalysisReport';
import AIAnalyzer from './components/AIAnalyzer';
import SearchBar from './components/SearchBar';

function App() {
  const [repoInfo, setRepoInfo] = useState(null);
  const [selectedBranches, setSelectedBranches] = useState({
    from: '',
    to: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Filter diff data based on search query
  const getFilteredDiffData = () => {
    if (!diffData || !diffData.files || !searchQuery) {
      return diffData;
    }

    const filteredFiles = diffData.files.filter(file => 
      file.path.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      ...diffData,
      files: filteredFiles
    };
  };

  // Update navigation component to use Link and handle active state
  const Navigation = () => {
    const location = useLocation();
    
    return (
      <nav className="app-nav">
        <div className="nav-container">
          <button 
            className="mobile-menu-toggle"
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
          
          <div className="search-container">
            <SearchBar onSearch={handleSearch} placeholder="Search files..." />
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

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isLoading && !diffData && (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            Loading repository information...
          </div>
        )}

        {repoInfo && (
          <>
            <Navigation />
            <main className="app-main">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <DiffViewer 
                      fromBranch={selectedBranches.from} 
                      toBranch={selectedBranches.to} 
                      diffData={getFilteredDiffData()}
                    />
                  } 
                />
                <Route 
                  path="/impact" 
                  element={
                    <AnalysisReport 
                      fromBranch={selectedBranches.from} 
                      toBranch={selectedBranches.to}
                      mode="impact"
                    />
                  } 
                />
                <Route 
                  path="/quality" 
                  element={
                    <AnalysisReport 
                      fromBranch={selectedBranches.from} 
                      toBranch={selectedBranches.to}
                      mode="quality"
                    />
                  } 
                />
                <Route 
                  path="/review" 
                  element={
                    <ReviewPanel 
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
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;