import React, { useState, useEffect } from 'react';
import { config } from '../config';
import './ProjectSelector.css';

const ProjectSelector = ({ onProjectSelect, selectedBranches, onBranchesChange, isLoading }) => {
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);

  const fetchBranches = async () => {
    try {
      // Try primary endpoint first
      let response = await fetch(`${config.API_BASE_URL}/api/branches`);
      
      // If primary endpoint fails, try fallback
      if (!response.ok) {
        response = await fetch(`${config.API_BASE_URL}${config.FALLBACK_API_ROUTE}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBranches(data.branches || []);
      setError(null);
    } catch (err) {
      setBranches([]);
      setError('Unable to load branches. Please ensure the backend server is running.');
      console.error('Branch fetch error:', err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleDirectorySelect = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/select-directory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      onProjectSelect(data);
      await fetchBranches(); // Refresh branches after selection
    } catch (err) {
      setError('Failed to select directory. Please try again.');
      console.error('Directory selection error:', err);
    }
  };

  return (
    <div className="project-selector">
      <div className="selector-header">
        <h2>Repository Selection</h2>
        <button 
          className="select-btn"
          onClick={handleDirectorySelect}
          disabled={isLoading}
        >
          {isLoading ? 'Selecting...' : 'Select Repository'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

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
