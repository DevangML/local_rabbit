import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

/**
 * Branch selector component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Component
 */
const BranchSelector = ({ 
  selectedFromBranch, 
  selectedToBranch, 
  onFromBranchChange, 
  onToBranchChange 
}) => {
  const { branches, loading, currentRepository } = useAppContext();

  if (!currentRepository) {
    return (
      <div className="branch-selector empty">
        <p>Please select a repository first</p>
      </div>
    );
  }

  if (loading && branches.length === 0) {
    return <div className="branch-selector loading">Loading branches...</div>;
  }

  if (branches.length === 0) {
    return (
      <div className="branch-selector empty">
        <p>No branches found for this repository</p>
      </div>
    );
  }

  return (
    <div className="branch-selector">
      <h2>Select Branches to Compare</h2>
      
      <div className="branch-selectors">
        {/* From branch selector */}
        <div className="branch-select">
          <label htmlFor="from-branch">From Branch:</label>
          <select
            id="from-branch"
            value={selectedFromBranch || ''}
            onChange={(e) => onFromBranchChange(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Select source branch --</option>
            {branches.map((branch) => (
              <option key={`from-${branch}`} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>
        
        {/* To branch selector */}
        <div className="branch-select">
          <label htmlFor="to-branch">To Branch:</label>
          <select
            id="to-branch"
            value={selectedToBranch || ''}
            onChange={(e) => onToBranchChange(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Select target branch --</option>
            {branches.map((branch) => (
              <option key={`to-${branch}`} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Selected branches info */}
      {selectedFromBranch && selectedToBranch && (
        <div className="selected-branches">
          <p>
            Comparing <strong>{selectedFromBranch}</strong> to{' '}
            <strong>{selectedToBranch}</strong>
          </p>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && <div className="loading-indicator">Loading...</div>}
    </div>
  );
};

export default BranchSelector; 