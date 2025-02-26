import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import DiffViewer from './components/DiffViewer';
import ReviewPanel from './components/ReviewPanel';
import AnalysisReport from './components/AnalysisReport';

function App() {
  const [repoPath, setRepoPath] = useState('');
  const [repoInfo, setRepoInfo] = useState(null);
  const [selectedBranches, setSelectedBranches] = useState({
    from: '',
    to: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we already have a repository set
    fetchRepoInfo();
  }, []);

  const fetchRepoInfo = async () => {
    try {
      const response = await fetch('/api/repo-info');
      if (response.ok) {
        const data = await response.json();
        setRepoInfo(data);
        setRepoPath(data.repoPath);
        
        // Set default branches
        if (data.branches.length > 0) {
          setSelectedBranches({
            from: data.branches[0],
            to: data.currentBranch
          });
        }
      }
    } catch (error) {
      console.error('Error fetching repository info:', error);
    }
  };

  const handleSetRepo = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/set-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: repoPath })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set repository');
      }
      
      await fetchRepoInfo();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Local CodeRabbit</h1>
          <p>PR Review Tool for Local Git Repositories</p>
        </header>
        
        <div className="repo-selector">
          {!repoInfo ? (
            <form onSubmit={handleSetRepo}>
              <div className="form-group">
                <label htmlFor="repoPath">Repository Path:</label>
                <input
                  type="text"
                  id="repoPath"
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  placeholder="/path/to/your/git/repository"
                  required
                />
              </div>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Set Repository'}
              </button>
              {error && <div className="error">{error}</div>}
            </form>
          ) : (
            <div className="repo-info">
              <div className="repo-path">
                <strong>Repository:</strong> {repoInfo.repoPath}
                <button 
                  className="small-button" 
                  onClick={() => setRepoInfo(null)}
                >
                  Change
                </button>
              </div>
              
              <div className="branch-selector">
                <div className="branch-select">
                  <label htmlFor="fromBranch">Base Branch:</label>
                  <select
                    id="fromBranch"
                    value={selectedBranches.from}
                    onChange={(e) => setSelectedBranches({
                      ...selectedBranches,
                      from: e.target.value
                    })}
                  >
                    {repoInfo.branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
                
                <div className="branch-select">
                  <label htmlFor="toBranch">Compare Branch:</label>
                  <select
                    id="toBranch"
                    value={selectedBranches.to}
                    onChange={(e) => setSelectedBranches({
                      ...selectedBranches,
                      to: e.target.value
                    })}
                  >
                    {repoInfo.branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {repoInfo && (
          <nav className="app-nav">
            <ul>
              <li>
                <Link to="/">Diff Viewer</Link>
              </li>
              <li>
                <Link to="/impact">Impact Analyzer</Link>
              </li>
              <li>
                <Link to="/quality">Quality Analyzer</Link>
              </li>
              <li>
                <Link to="/review">Code Reviewer</Link>
              </li>
            </ul>
          </nav>
        )}
        
        <main className="app-main">
          {repoInfo && (
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
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;