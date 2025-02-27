import React, { useState } from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const handleFilterChange = (category, value) => {
    const updatedFilters = {
      ...activeFilters,
      [category]: value
    };
    
    // Remove filters with empty values
    if (!value || (Array.isArray(value) && value.length === 0)) {
      delete updatedFilters[category];
    }
    
    setActiveFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case 'select':
        return (
          <select
            value={activeFilters[filter.id] || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          >
            <option value="">All {filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'checkbox-group':
        return (
          <div className="checkbox-group">
            {filter.options.map((option) => {
              const isChecked = activeFilters[filter.id]?.includes(option.value) || false;
              return (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const currentValues = activeFilters[filter.id] || [];
                      let newValues;
                      
                      if (isChecked) {
                        newValues = currentValues.filter(v => v !== option.value);
                      } else {
                        newValues = [...currentValues, option.value];
                      }
                      
                      handleFilterChange(filter.id, newValues);
                    }}
                  />
                  <span className="checkbox-text">{option.label}</span>
                </label>
              );
            })}
          </div>
        );
        
      case 'range':
        return (
          <div className="range-filter">
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              step={filter.step}
              value={activeFilters[filter.id] || filter.defaultValue}
              onChange={(e) => handleFilterChange(filter.id, parseInt(e.target.value))}
            />
            <span className="range-value">{activeFilters[filter.id] || filter.defaultValue}</span>
          </div>
        );
        
      default:
        return null;
    }
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  const resetFilters = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  return (
    <div className="filter-panel">
      <div className="filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="filter-title">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="filter-badge">{getActiveFilterCount()}</span>
          )}
        </div>
        <svg
          className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      
      {isExpanded && (
        <div className="filter-content">
          {filters.map((filter) => (
            <div key={filter.id} className="filter-item">
              <label className="filter-label">{filter.label}</label>
              {renderFilterInput(filter)}
            </div>
          ))}
          
          {getActiveFilterCount() > 0 && (
            <button className="reset-filters-button" onClick={resetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;