import React from 'react';
import PropTypes from 'prop-types';
import './BranchSelector.css';

const BranchSelector = ({ branches, selectedBranch, onSelect, label, isLoading }) => {
  if (!branches || branches.length === 0) {
    return <div className="branch-selector-empty">No branches available</div>;
  }

  return (
    <div className="branch-selector">
      <label htmlFor={`branch-select-${label}`}>{label}</label>
      <select
        id={`branch-select-${label}`}
        value={selectedBranch || ''}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isLoading}
      >
        <option value="">Select a branch</option>
        {branches.map((branch) => (
          <option key={branch} value={branch}>
            {branch}
          </option>
        ))}
      </select>
    </div>
  );
};

BranchSelector.propTypes = {
  branches: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedBranch: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  isLoading: PropTypes.bool
};

BranchSelector.defaultProps = {
  selectedBranch: null,
  isLoading: false
};

export default BranchSelector; 