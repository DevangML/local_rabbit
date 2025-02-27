import React, { useState, useRef, useEffect } from 'react';
import './DiffSearch.css';

const PREDEFINED_FILTERS = {
  diffTypes: ['Added', 'Modified', 'Deleted', 'Renamed'],
  fileTypes: ['JavaScript', 'TypeScript', 'CSS', 'HTML', 'JSON', 'Other'],
  severity: ['High', 'Medium', 'Low'],
  status: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
  qualityMetrics: ['Complexity', 'Coverage', 'Duplication', 'Style Issues']
};

const DEFAULT_FILTERS = {
  diffTypes: [],
  fileTypes: [],
  severity: [],
  status: [],
  qualityMetrics: [],
  widgetTypes: [],
  changeTypes: []
};

const DiffSearch = ({ onSearch, initialFilters = {}, initialQuery = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState({ ...DEFAULT_FILTERS, ...initialFilters });
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const flutterFilters = {
    fileTypes: [
      { label: 'Dart Files', value: 'DART' },
      { label: 'Widget Files', value: 'WIDGET' },
      { label: 'Screen Files', value: 'SCREEN' },
      { label: 'Model Files', value: 'MODEL' },
      { label: 'Service Files', value: 'SERVICE' },
      { label: 'Test Files', value: 'TEST' },
      { label: 'Other', value: 'OTHER' }
    ],
    widgetTypes: [
      { label: 'Stateless Widgets', value: 'STATELESS' },
      { label: 'Stateful Widgets', value: 'STATEFUL' },
      { label: 'BLoC Components', value: 'BLOC' },
      { label: 'Provider Components', value: 'PROVIDER' }
    ],
    changeTypes: [
      { label: 'UI Changes', value: 'UI' },
      { label: 'Logic Changes', value: 'LOGIC' },
      { label: 'State Management', value: 'STATE' },
      { label: 'Dependencies', value: 'DEPENDENCIES' }
    ]
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSearch({ query, filters: activeFilters });
    setIsOpen(false);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const handleFilterChange = (category, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: Array.isArray(prev[category]) ? 
        prev[category].includes(value) ?
          prev[category].filter(item => item !== value) :
          [...prev[category], value] :
        [value]
    }));
  };

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => {
      const current = Array.isArray(prev[category]) ? prev[category] : [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return {
        ...prev,
        [category]: updated
      };
    });
  };

  const isFilterActive = (category, value) => {
    return Array.isArray(activeFilters[category]) && activeFilters[category].includes(value);
  };

  const clearFilters = () => {
    setActiveFilters(DEFAULT_FILTERS);
    setQuery('');
    handleSubmit();
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((count, filterArray) => 
      count + (Array.isArray(filterArray) ? filterArray.length : 0), 0);
  };

  return (
    <div className="diff-search-container" ref={searchContainerRef}>
      <div className="search-input-wrapper">
        <input
          ref={searchInputRef}
          type="text"
          className="diff-search-input"
          placeholder="Search in diffs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <button 
          className="filter-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          aria-label="Toggle filters"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1.5 3.5h13m-13 4h13m-13 4h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="filter-count">
            {getActiveFilterCount()}
          </span>
        </button>
        <button 
          className="search-btn"
          onClick={handleSubmit}
          aria-label="Search"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M7.5 13.5a6 6 0 100-12 6 6 0 000 12zM11.5 11.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="filters-dropdown" ref={dropdownRef}>
          <div className="filters-header">
            <h3>Search Filters</h3>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear all
            </button>
          </div>
          
          <div className="filters-content">
            {Object.entries(PREDEFINED_FILTERS).map(([category, options]) => (
              <div key={category} className="filter-group">
                <h4>{category.replace(/([A-Z])/g, ' $1').trim()}</h4>
                <div className="filter-options">
                  {options.map(option => (
                    <label key={option} className="filter-option">
                      <input
                        type="checkbox"
                        checked={isFilterActive(category, option)}
                        onChange={() => handleFilterChange(category, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flutter-filters">
              {Object.entries(flutterFilters).map(([category, options]) => (
                <div key={category} className="filter-group">
                  <div className="filter-group-title">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="filter-options">
                    {options.map(({ label, value }) => (
                      <button
                        key={value}
                        className={`filter-option ${isFilterActive(category, value) ? 'active' : ''}`}
                        onClick={() => toggleFilter(category, value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="filters-footer">
            <button 
              className="apply-filters-btn"
              onClick={handleSubmit}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffSearch; 