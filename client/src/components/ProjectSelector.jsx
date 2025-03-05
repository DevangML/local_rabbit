import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { config } from '../config';
import { cacheInstance } from '../utils/cache';
import './ProjectSelector.css';

// Maximum number of recent repositories to remember
const MAX_RECENT_REPOS = 5;

const ProjectSelector = ({ onProjectSelect, selectedBranches, onBranchesChange, isLoading: externalLoading }) => {
  const [branches, setBranches] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentRepositories, setRecentRepositories] = useState([]);
  const { isDark } = useSelector(state => state.theme);

  // Load recent repositories from localStorage on component mount
  useEffect(() => {
    try {
      const storedRepos = localStorage.getItem('recentRepositories');
      if (storedRepos) {
        setRecentRepositories(JSON.parse(storedRepos));
      }
    } catch (err) {
      console.error('Error loading recent repositories:', err);
    }
  }, []);

  // Fetch branches when repository is selected
  useEffect(() => {
    if (selectedRepository) {
      fetchBranches();

      // Add to recent repositories
      addToRecentRepositories(selectedRepository);
    }
  }, [selectedRepository]);

  // Add a repository to the recent repositories list
  const addToRecentRepositories = (repo) => {
    try {
      // Create new array without the current repo (if it exists)
      const filteredRepos = recentRepositories.filter(
        (r) => r.path !== repo.path
      );

      // Add the current repo to the beginning
      const updatedRepos = [repo, ...filteredRepos].slice(0, MAX_RECENT_REPOS);

      setRecentRepositories(updatedRepos);

      // Save to localStorage
      localStorage.setItem('recentRepositories', JSON.stringify(updatedRepos));
    } catch (err) {
      console.error('Error saving recent repositories:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/repo/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ path: selectedRepository.path }),
      });

      // Add null/undefined check before accessing response.ok
      if (!response || !response.ok) {
        const errorText = response ? await response.text() : 'No response received';
        console.error('Branch fetch error response:', response ? response.status : 'undefined', errorText);
        throw new Error(`HTTP error! status: ${response ? response.status : 'undefined'}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Branches loaded:', data);
      setBranches(Array.isArray(data.branches) ? data.branches : []);
    } catch (err) {
      setBranches([]);
      setError('Unable to load branches. Please ensure the backend server is running.');
      console.error('Branch fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderSelect = async (e) => {
    e.preventDefault();

    // More robust way to get the form value that works in both real usage and tests
    let folderPath;

    // Try to get the value from the form elements collection
    if (e.target.elements && e.target.elements.folderPath) {
      folderPath = e.target.elements.folderPath.value;
    }
    // Fallback to direct property access
    else if (e.target.folderPath) {
      folderPath = e.target.folderPath.value;
    }
    // Last resort - try to find the input by ID
    else {
      const input = document.getElementById('folderPath');
      folderPath = input ? input.value : '';
    }

    if (!folderPath) {
      setError('Please enter a folder path');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      console.log('Selecting repository:', folderPath);

      // Clear all caches before setting a new repository
      cacheInstance.clear();

      // Use relative URL to let Vite proxy handle the request
      const response = await fetch(`/api/repository/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: folderPath }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Repository selection error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Repository selected:', data);
      setSelectedRepository(data);
      onProjectSelect(data);
      setBranches(Array.isArray(data.branches) ? data.branches : []);
      onBranchesChange({ from: '', to: '' });
    } catch (err) {
      setError('Failed to select repository. Please ensure the path is a valid git repository.');
      console.error('Repository selection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecentRepoSelect = async (repoPath) => {
    if (!repoPath) return;

    try {
      setError(null);
      setLoading(true);
      console.log('Selecting recent repository:', repoPath);

      // Update input field for visual feedback
      const input = document.getElementById('folderPath');
      if (input) {
        input.value = repoPath;
      }

      // Clear all caches before setting a new repository
      cacheInstance.clear();

      // Use relative URL to let Vite proxy handle the request
      const response = await fetch(`/api/repository/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: repoPath }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Repository selection error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Repository selected:', data);
      setSelectedRepository(data);
      onProjectSelect(data);
      setBranches(Array.isArray(data.branches) ? data.branches : []);
      onBranchesChange({ from: '', to: '' });
    } catch (err) {
      setError('Failed to select repository. Please ensure the path is a valid git repository.');
      console.error('Repository selection error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Combined loading state
  const isLoading = loading || externalLoading;

  return (
    <div className={`project-selector ${isDark ? 'dark' : 'light'}`}>
      <div className="selector-header">
        <h2>Repository Selection</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="repository-selector">
        <form id="repoForm" onSubmit={handleFolderSelect}>
          <div className="folder-input-container">
            <label htmlFor="folderPath">Repository Path:</label>
            <input
              type="text"
              id="folderPath"
              name="folderPath"
              placeholder="Enter path to git repository (e.g., ~/Documents/my-repo)"
              defaultValue={selectedRepository ? selectedRepository.path : ''}
              disabled={isLoading}
              className="folder-path-input"
            />
            <button
              type="submit"
              className="select-folder-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Set Repository'}
            </button>
          </div>
        </form>

        <div className="path-examples">
          <p className="info-message">
            <strong>Examples:</strong>
            <br />
            macOS/Linux: <code>~/Documents/my-repo</code> or <code>/Users/username/Documents/my-repo</code>
            <br />
            Windows: <code>~/Documents/my-repo</code> or <code>C:\Users\username\Documents\my-repo</code>
          </p>
        </div>

        {recentRepositories.length > 0 && (
          <div className="recent-repositories">
            <h3>Recent Repositories</h3>
            <ul className="recent-repo-list">
              {recentRepositories.map((repo) => (
                <li key={repo.path} className="recent-repo-item">
                  <button
                    type="button"
                    onClick={() => handleRecentRepoSelect(repo.path)}
                    className="recent-repo-btn"
                    disabled={isLoading}
                  >
                    <span className="repo-name">{repo.name}</span>
                    <span className="repo-path">{repo.path}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="allowed-paths-info">
          <p className="info-message">
            <strong>Note:</strong> For security reasons, only repositories in the following directories are allowed:
            <br />
            ~/Documents, ~/Projects, ~/Development, ~/Code, ~/Github, ~/repos, ~/git, ~/workspace, ~/dev
          </p>
        </div>
      </div>

      {selectedRepository && (
        <div className="selected-repo-info">
          <p>Selected repository: <strong>{selectedRepository.name}</strong></p>
        </div>
      )}

      <div className="branch-selectors">
        <div className="branch-select">
          <label>Base Branch:</label>
          <select
            value={selectedBranches.from}
            onChange={(e) => onBranchesChange({ ...selectedBranches, from: e.target.value })}
            disabled={isLoading || branches.length === 0}
          >
            <option value="">Select base branch</option>
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>

        <div className="branch-select">
          <label>Compare Branch:</label>
          <select
            value={selectedBranches.to}
            onChange={(e) => onBranchesChange({ ...selectedBranches, to: e.target.value })}
            disabled={isLoading || branches.length === 0}
          >
            <option value="">Select compare branch</option>
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelector;
