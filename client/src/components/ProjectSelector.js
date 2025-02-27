import React, { useState, useEffect, useRef } from 'react';
import './ProjectSelector.css';

const ProjectSelector = ({ 
  repoInfo, 
  onSelectProject, 
  selectedBranches, 
  onBranchesChange,
  isLoading,
  onRefresh
}) => {
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  // Reset search states when branches change
  useEffect(() => {
    setFromSearch('');
    setToSearch('');
    setFromDropdownOpen(false);
    setToDropdownOpen(false);
  }, [selectedBranches.from, selectedBranches.to]);

  const handleDirectorySelect = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const dirName = dirHandle.name;
      
      // Get a sample of file paths to help locate the repository
      const samplePaths = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          samplePaths.push(entry.name);
        }
        if (samplePaths.length >= 5) break;
      }
      
      onSelectProject({ name: dirName, samplePaths });
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled the selection
        return;
      }
      console.error('Error selecting directory:', error);
      alert('Failed to select directory: ' + error.message);
    }
  };

  const handleClickOutside = (event) => {
    if (fromRef.current && !fromRef.current.contains(event.target)) {
      setFromDropdownOpen(false);
    }
    if (toRef.current && !toRef.current.contains(event.target)) {
      setToDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getFilteredBranches = (searchQuery) => {
    return repoInfo?.branches?.filter(branch => 
      branch.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  };

  const handleRefreshClick = async (e) => {
    e.preventDefault();
    // Reset all states
    setFromSearch('');
    setToSearch('');
    setFromDropdownOpen(false);
    setToDropdownOpen(false);
    
    // Reset branch selection
    onBranchesChange({ from: '', to: '' });
    
    // Call the refresh handler
    if (onRefresh) {
      await onRefresh();
    }
  };

  const handleBranchSelect = (type, branch) => {
    // Reset the other branch if it's the same as the selected one
    const newBranches = { ...selectedBranches };
    
    if (type === 'from') {
      if (branch === selectedBranches.to) {
        newBranches.to = '';
      }
      newBranches.from = branch;
      setFromDropdownOpen(false);
    } else {
      if (branch === selectedBranches.from) {
        newBranches.from = '';
      }
      newBranches.to = branch;
      setToDropdownOpen(false);
    }
    
    onBranchesChange(newBranches);
  };

  return (
    <div className="project-selector">
      <div className="select-section">
        <h2>Select Git Repository</h2>
        {!repoInfo && (
          <button 
            onClick={handleDirectorySelect}
            disabled={isLoading}
            className="select-button"
          >
            {isLoading ? 'Loading...' : 'Select Directory'}
          </button>
        )}
        {repoInfo && (
          <div className="repo-info">
            <p>Current repository: {repoInfo.repoPath}</p>
          </div>
        )}
      </div>

      {repoInfo && repoInfo.branches && repoInfo.branches.length > 0 && (
        <div className="branch-selector">
          <div className="branch-header">
            <h3>Compare Branches</h3>
            <button 
              className={`refresh-button ${isLoading ? 'loading' : ''}`}
              onClick={handleRefreshClick}
              disabled={isLoading}
              title="Refresh branches"
            >
              <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                className="refresh-icon"
              >
                <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </button>
          </div>
          <div className="branch-inputs">
            <div className="branch-select" ref={fromRef}>
              <label>From:</label>
              <div className="select-container">
                <div 
                  className="branch-display"
                  onClick={() => setFromDropdownOpen(!fromDropdownOpen)}
                >
                  <span>{selectedBranches.from || 'Select branch'}</span>
                  <span className="dropdown-arrow">▼</span>
                </div>
                {fromDropdownOpen && (
                  <div className="dropdown-container">
                    <input
                      type="text"
                      className="branch-search"
                      placeholder="Search branches..."
                      value={fromSearch}
                      onChange={(e) => setFromSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="branch-options">
                      {getFilteredBranches(fromSearch).map(branch => (
                        <div
                          key={branch}
                          className={`branch-option ${selectedBranches.from === branch ? 'selected' : ''}`}
                          onClick={() => handleBranchSelect('from', branch)}
                        >
                          {branch}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="branch-select" ref={toRef}>
              <label>To:</label>
              <div className="select-container">
                <div 
                  className="branch-display"
                  onClick={() => setToDropdownOpen(!toDropdownOpen)}
                >
                  <span>{selectedBranches.to || 'Select branch'}</span>
                  <span className="dropdown-arrow">▼</span>
                </div>
                {toDropdownOpen && (
                  <div className="dropdown-container">
                    <input
                      type="text"
                      className="branch-search"
                      placeholder="Search branches..."
                      value={toSearch}
                      onChange={(e) => setToSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="branch-options">
                      {getFilteredBranches(toSearch).map(branch => (
                        <div
                          key={branch}
                          className={`branch-option ${selectedBranches.to === branch ? 'selected' : ''}`}
                          onClick={() => handleBranchSelect('to', branch)}
                        >
                          {branch}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector; 