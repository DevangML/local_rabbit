import React, { useState, useEffect, useRef } from 'react';
import { config } from '../config.js';
import './ProjectSelector.css';

const ProjectSelector = ({ 
  onProjectSelect,
  selectedBranches,
  onBranchesChange,
  isLoading,
  onRefresh
}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    setFromSearch('');
    setToSearch('');
    setFromDropdownOpen(false);
    setToDropdownOpen(false);
  }, [selectedBranches.from, selectedBranches.to]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectorySelect = async () => {
    if (isSelecting) return;
    
    setIsSelecting(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/projects/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to select directory');
      }

      const project = await response.json();
      if (project.branches?.length > 0) {
        onBranchesChange({
          from: project.current || project.branches[0],
          to: project.branches[0]
        });
      }
      onProjectSelect(project);
    } catch (err) {
      setError('Error selecting directory: ' + err.message);
      console.error('Directory selection error:', err);
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredBranches = (searchQuery) => {
    return projects.filter(project => 
      project.branches?.some(branch => 
        branch.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const handleRefreshClick = async (e) => {
    e.preventDefault();
    setFromSearch('');
    setToSearch('');
    setFromDropdownOpen(false);
    setToDropdownOpen(false);
    onBranchesChange({ from: '', to: '' });
    if (onRefresh) await onRefresh();
  };

  const handleBranchSelect = (type, branch) => {
    const newBranches = { ...selectedBranches };
    
    if (type === 'from') {
      if (branch === selectedBranches.to) newBranches.to = '';
      newBranches.from = branch;
      setFromDropdownOpen(false);
    } else {
      if (branch === selectedBranches.from) newBranches.from = '';
      newBranches.to = branch;
      setToDropdownOpen(false);
    }
    
    onBranchesChange(newBranches);
  };

  if (loading) return <div className="loading">Loading projects...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="project-selector">
      <div className="project-selector-header">
        <h2>Select Project</h2>
        <button
          className="btn btn-primary"
          onClick={handleDirectorySelect}
          disabled={isSelecting || isLoading}
        >
          {isSelecting ? 'Selecting...' : 'Select Directory'}
        </button>
      </div>

      {projects.length > 0 && (
        <div className="branch-selector">
          <div className="branch-select" ref={fromRef}>
            <label>From:</label>
            <select
              value={selectedBranches.from}
              onChange={e => handleBranchSelect('from', e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select branch</option>
              {getFilteredBranches(fromSearch).map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <div className="branch-select" ref={toRef}>
            <label>To:</label>
            <select
              value={selectedBranches.to}
              onChange={e => handleBranchSelect('to', e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select branch</option>
              {getFilteredBranches(toSearch).map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <button 
            className="refresh-button"
            onClick={handleRefreshClick}
            disabled={isLoading}
          >
            Refresh Branches
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
