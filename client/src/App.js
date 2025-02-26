import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import { API_BASE_URL } from './config';
import ProjectSelector from './components/ProjectSelector';
import DiffViewer from './components/DiffViewer';
import ReviewPanel from './components/ReviewPanel';
import AnalysisReport from './components/AnalysisReport';

function App() {
  const [repoInfo, setRepoInfo] = useState(null);
  const [selectedBranches, setSelectedBranches] = useState({
    from: '',
    to: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const fetchRepoInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/repo-info`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched repo info:', data);
        setRepoInfo(data);
        
        // Set default branches if available
        if (data.branches && data.branches.length > 0) {
          setSelectedBranches({
            from: data.branches[0],
            to: data.currentBranch || data.branches[0]
          });
        }
      }
    } catch (error) {
      console.error('Error fetching repository info:', error);
      setError('Failed to fetch repository information');
    }
  };

  // Update navigation component to use Link and handle active state
  const Navigation = () => {
    const location = useLocation();
    
    return (
      <nav className="app-nav">
        <ul>
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Diff View
            </Link>
          </li>
          <li>
            <Link 
              to="/impact" 
              className={location.pathname === '/impact' ? 'active' : ''}
            >
              Impact Analysis
            </Link>
          </li>
          <li>
            <Link 
              to="/quality" 
              className={location.pathname === '/quality' ? 'active' : ''}
            >
              Quality Check
            </Link>
          </li>
          <li>
            <Link 
              to="/review" 
              className={location.pathname === '/review' ? 'active' : ''}
            >
              Review
            </Link>
          </li>
        </ul>
      </nav>
    );
  };

  console.log('Current state:', { repoInfo, selectedBranches, isLoading });

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Local CodeRabbit</h1>
          <p>PR Review Tool for Local Git Repositories</p>
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

        {isLoading && (
          <div className="loading-message">
            Loading repository information...
          </div>
        )}

        {repoInfo && !isLoading && (
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
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;