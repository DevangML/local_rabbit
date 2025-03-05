import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';

/**
 * Repository selector component
 * @returns {JSX.Element} - Component
 */
const RepositorySelector = () => {
  const { repositories, currentRepository, loading, error, selectRepository } = useAppContext();
  const [customPath, setCustomPath] = useState('');

  /**
   * Handle repository selection
   * @param {Object} event - Event object
   */
  const handleSelectRepository = (event) => {
    const path = event.target.value;
    if (path === 'custom') {
      return; // Don't do anything, user will enter custom path
    }
    selectRepository(path);
  };

  /**
   * Handle custom path input change
   * @param {Object} event - Event object
   */
  const handleCustomPathChange = (event) => {
    setCustomPath(event.target.value);
  };

  /**
   * Handle custom path submission
   * @param {Object} event - Event object
   */
  const handleCustomPathSubmit = (event) => {
    event.preventDefault();
    if (customPath.trim()) {
      selectRepository(customPath.trim());
      setCustomPath('');
    }
  };

  if (loading && repositories.length === 0) {
    return <div className="repository-selector loading">Loading repositories...</div>;
  }

  if (error && repositories.length === 0) {
    return (
      <div className="repository-selector error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="repository-selector">
      <h2>Select Repository</h2>
      
      {/* Repository dropdown */}
      <div className="select-container">
        <select 
          value={currentRepository ? currentRepository.path : ''} 
          onChange={handleSelectRepository}
          disabled={loading}
        >
          <option value="">-- Select a repository --</option>
          {repositories.map((repo) => (
            <option key={repo.id} value={repo.path}>
              {repo.name} ({repo.path})
            </option>
          ))}
          <option value="custom">Custom path...</option>
        </select>
        {loading && <span className="loading-indicator">Loading...</span>}
      </div>
      
      {/* Custom path input */}
      <form onSubmit={handleCustomPathSubmit} className="custom-path-form">
        <input
          type="text"
          value={customPath}
          onChange={handleCustomPathChange}
          placeholder="Enter repository path"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !customPath.trim()}>
          Set Repository
        </button>
      </form>
      
      {/* Current repository info */}
      {currentRepository && (
        <div className="current-repository">
          <h3>Current Repository</h3>
          <p><strong>Name:</strong> {currentRepository.name}</p>
          <p><strong>Path:</strong> {currentRepository.path}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default RepositorySelector; 