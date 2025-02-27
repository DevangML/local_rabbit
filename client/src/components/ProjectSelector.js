import React from 'react';
import './ProjectSelector.css';

const ProjectSelector = ({ 
  repoInfo, 
  onSelectProject, 
  selectedBranches, 
  onBranchesChange,
  isLoading 
}) => {
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

  return (
    <div className="project-selector">
      <div className="select-section">
        <h2>Select Git Repository</h2>
        <button 
          onClick={handleDirectorySelect}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Select Directory'}
        </button>
        {repoInfo && (
          <div className="repo-info">
            <p>Current repository: {repoInfo.repoPath}</p>
          </div>
        )}
      </div>

      {repoInfo && repoInfo.branches && repoInfo.branches.length > 0 && (
        <div className="branch-selector">
          <h3>Compare Branches</h3>
          <div className="branch-inputs">
            <div className="branch-select">
              <label>From:</label>
              <select
                value={selectedBranches.from}
                onChange={(e) => onBranchesChange({
                  ...selectedBranches,
                  from: e.target.value
                })}
                disabled={isLoading}
              >
                {repoInfo.branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            
            <div className="branch-select">
              <label>To:</label>
              <select
                value={selectedBranches.to}
                onChange={(e) => onBranchesChange({
                  ...selectedBranches,
                  to: e.target.value
                })}
                disabled={isLoading}
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
  );
};

export default ProjectSelector; 