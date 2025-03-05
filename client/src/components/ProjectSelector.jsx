import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { config } from '../config';
import './ProjectSelector.css';

const ProjectSelector = ({ onProjectSelect, selectedBranches, onBranchesChange, isLoading }) => {
  const [repositories, setRepositories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [error, setError] = useState(null);
  const { isDark } = useSelector(state => state.theme);

  // Fetch available repositories
  useEffect(() => {
    fetchRepositories();
  }, []);

  // Fetch branches when repository is selected
  useEffect(() => {
    if (selectedRepository) {
      fetchBranches();
    }
  }, [selectedRepository]);

  const fetchRepositories = async () => {
    try {
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/repositories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRepositories(data);
    } catch (err) {
      setError('Unable to load repositories. Please ensure the backend server is running.');
      console.error('Repository fetch error:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/repository/branches`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBranches(data.branches || []);
    } catch (err) {
      setBranches([]);
      setError('Unable to load branches. Please ensure the backend server is running.');
      console.error('Branch fetch error:', err);
    }
  };

  const handleRepositorySelect = async (repositoryPath) => {
    try {
      setError(null);
      const response = await fetch(`${config.API_BASE_URL}/api/repository/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: repositoryPath }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedRepository(data);
      onProjectSelect(data);
      setBranches(data.branches || []);
      onBranchesChange({ from: '', to: '' });
    } catch (err) {
      setError('Failed to select repository. Please try again.');
      console.error('Repository selection error:', err);
    }
  };

  return (
    <div className={`project-selector ${isDark ? 'dark' : 'light'}`}>
      <div className="selector-header">
        <h2>Repository Selection</h2>
        <button 
          className="refresh-btn"
          onClick={fetchRepositories}
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="repository-selector">
        <label>Select Repository:</label>
        <select
          value={selectedRepository ? selectedRepository.path : ''}
          onChange={(e) => handleRepositorySelect(e.target.value)}
          disabled={isLoading || repositories.length === 0}
        >
          <option value="">Select a repository</option>
          {repositories.map(repo => (
            <option key={repo.path} value={repo.path}>{repo.name}</option>
          ))}
        </select>
      </div>

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
