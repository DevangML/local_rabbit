import React, { useState } from 'react';
import { FaFolder, FaCodeBranch, FaExchangeAlt } from 'react-icons/fa';
import './ProjectSelector.css';

const ProjectSelector = ({ 
  repoInfo, 
  onSelectProject, 
  selectedBranches, 
  onBranchesChange,
  onStartAnalysis 
}) => {
  const [isSelectingProject, setIsSelectingProject] = useState(!repoInfo);
  const [error, setError] = useState(null);

  const handleProjectSelect = async () => {
    try {
      setError(null);
      
      // Create an input element for directory selection
      const input = document.createElement('input');
      input.type = 'file';
      input.webkitdirectory = true;
      input.directory = true;
      
      const promise = new Promise((resolve, reject) => {
        input.onchange = async () => {
          if (input.files.length > 0) {
            try {
              // Get all files and find .git directory
              const files = Array.from(input.files);
              const gitDir = files.find(file => 
                file.webkitRelativePath.endsWith('.git') || 
                file.webkitRelativePath.includes('/.git/')
              );
              
              if (!gitDir) {
                reject(new Error('Selected directory is not a git repository. Please select a directory that contains a .git folder.'));
                return;
              }
              
              // Get the repository root path by finding the parent of .git
              const pathParts = gitDir.webkitRelativePath.split('/');
              const repoName = pathParts[0]; // This is the selected directory name
              
              // Get all unique directories from the files
              const directories = new Set(
                files.map(file => {
                  const parts = file.webkitRelativePath.split('/');
                  return parts[0]; // Get the root directory name
                })
              );

              if (directories.size !== 1) {
                reject(new Error('Invalid directory structure'));
                return;
              }

              const selectedDir = Array.from(directories)[0];
              
              // Get a sample of file paths to help server locate the repository
              const samplePaths = files
                .filter(file => !file.webkitRelativePath.includes('node_modules'))
                .slice(0, 10)
                .map(f => f.webkitRelativePath);
              
              console.log('Selected directory:', selectedDir);
              
              // Make the API call to set the repository
              const response = await fetch('http://localhost:3001/api/set-repo', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                  name: selectedDir,
                  samplePaths
                })
              });

              let data;
              const contentType = response.headers.get('content-type');
              if (contentType && contentType.includes('application/json')) {
                data = await response.json();
              } else {
                console.error('Non-JSON response:', await response.text());
                throw new Error('Server returned non-JSON response');
              }

              if (!response.ok) {
                throw new Error(data.error || 'Failed to set repository');
              }

              // Store the repository info
              const repoInfo = {
                repoPath: data.repoPath,
                branches: data.branches || [],
                currentBranch: data.currentBranch
              };

              resolve(repoInfo);
            } catch (error) {
              console.error('Error in file processing:', error);
              reject(error);
            }
          } else {
            reject(new Error('No directory selected'));
          }
        };

        input.onerror = (error) => {
          console.error('File input error:', error);
          reject(new Error('Error selecting directory'));
        };
      });
      
      input.click();
      const data = await promise;
      onSelectProject(data);  // Pass the full data object with branches
      
    } catch (error) {
      console.error('Error selecting directory:', error);
      if (error.name === 'SecurityError') {
        setError('Permission denied. Please allow access to the directory.');
      } else if (error.message.includes('JSON')) {
        setError('Server communication error. Please try again.');
      } else {
        setError(error.message || 'Failed to select directory');
      }
    }
  };

  return (
    <div className="project-selector">
      {isSelectingProject ? (
        <div className="project-picker">
          <h2>Select a Git Project</h2>
          <button className="select-button" onClick={handleProjectSelect}>
            <FaFolder className="icon" />
            Choose Project Directory
          </button>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <p className="helper-text">Select a local Git repository to analyze</p>
        </div>
      ) : (
        repoInfo && (
          <div className="project-config">
            <div className="current-project">
              <h3>Current Project</h3>
              <div className="project-path">
                <span>{repoInfo.repoPath}</span>
                <button 
                  className="change-button"
                  onClick={() => {
                    setIsSelectingProject(true);
                    setError(null);
                  }}
                >
                  Change Project
                </button>
              </div>
            </div>

            <div className="branch-selection">
              <div className="branch-group">
                <label>
                  <FaCodeBranch className="icon" />
                  Base Branch
                </label>
                <select
                  value={selectedBranches.from}
                  onChange={(e) => onBranchesChange({
                    ...selectedBranches,
                    from: e.target.value
                  })}
                >
                  {repoInfo.branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <FaExchangeAlt className="exchange-icon" />

              <div className="branch-group">
                <label>
                  <FaCodeBranch className="icon" />
                  Compare Branch
                </label>
                <select
                  value={selectedBranches.to}
                  onChange={(e) => onBranchesChange({
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

            <button 
              className="start-button"
              onClick={onStartAnalysis}
              disabled={selectedBranches.from === selectedBranches.to}
            >
              Start Analysis
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default ProjectSelector; 