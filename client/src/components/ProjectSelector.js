import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';
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
  const [isSelecting, setIsSelecting] = useState(false);

  // Reset search states when branches change
  useEffect(() => {
    setFromSearch('');
    setToSearch('');
    setFromDropdownOpen(false);
    setToDropdownOpen(false);
  }, [selectedBranches.from, selectedBranches.to]);

  const handleDirectorySelect = async () => {
    try {
      setIsSelecting(true);
      const response = await fetch(`${API_BASE_URL}/api/select-directory`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      onSelectProject(data);
    } catch (error) {
      console.error('Error selecting directory:', error);
    } finally {
      setIsSelecting(false);
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
      {!repoInfo ? (
        <div className="project-select">
          <button 
            className="select-button"
            onClick={handleDirectorySelect}
            disabled={isSelecting}
          >
            {isSelecting ? 'Selecting...' : 'Select Project Directory'}
          </button>
        </div>
      ) : (
        <div className="project-info">
          <div className="repo-details">
            <span className="repo-name">{repoInfo.name}</span>
            <button 
              className="change-button"
              onClick={handleDirectorySelect}
              disabled={isSelecting || isLoading}
            >
              Change
            </button>
          </div>
          <div className="branch-selector">
            <div className="branch-select">
              <label>From:</label>
              <select
                value={selectedBranches.from}
                onChange={e => onBranchesChange({
                  ...selectedBranches,
                  from: e.target.value
                })}
                disabled={isLoading}
              >
                {repoInfo.branches.map(branch => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
            <div className="branch-select">
              <label>To:</label>
              <select
                value={selectedBranches.to}
                onChange={e => onBranchesChange({
                  ...selectedBranches,
                  to: e.target.value
                })}
                disabled={isLoading}
              >
                {repoInfo.branches.map(branch => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
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