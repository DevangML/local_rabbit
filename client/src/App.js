import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const handleProjectSelect = async (path) => {
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/set-repo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set repository');
      }
      
      await fetchRepoInfo();
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchRepoInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/repo-info`);
      if (response.ok) {
        const data = await response.json();
        setRepoInfo(data);
        
        // Set default branches if available
        if (data.branches.length > 0) {
          setSelectedBranches({
            from: data.branches[0],
            to: data.currentBranch
          });
        }
      }
    } catch (error) {
      console.error('Error fetching repository info:', error);
      setError('Failed to fetch repository information');
    }
  };

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
  };

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
          onStartAnalysis={handleStartAnalysis}
        />

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isAnalyzing && repoInfo && (
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
        )}
      </div>
    </Router>
  );
}

export default App;