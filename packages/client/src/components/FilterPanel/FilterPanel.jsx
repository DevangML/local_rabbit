/* global console */
/* global console */
/* global console */
import React, { useState, useCallback } from "react";
import "./FilterPanel.css";

const FilterPanel = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilterChange = useCallback(
    async (category, value) => {
      setIsProcessing(true);
      try {
        const updatedFilters = {
          ...activeFilters,
          [category]: value,
        };

        // Remove filters with empty values
        if (!value || (Array.isArray(value) && value.length === 0)) {
          delete updatedFilters[category];
        }

        setActiveFilters(updatedFilters);
        onFilterChange(updatedFilters);
      } catch (error) {
        console.error("Error processing filters:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [activeFilters, onFilterChange],
  );

  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case "select":
        return (
          <select
            value={activeFilters[filter.id] || ""}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            disabled={isProcessing}
          >
            <option value="">All {filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="checkbox-group">
            {filter.options.map((option) => {
              const isChecked =
                activeFilters[filter.id]?.includes(option.value) || Boolean(false);
              return (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isProcessing}
                    onChange={async () => {
                      const currentValues = activeFilters[filter.id] || [];
                      let newValues;

                      if (isChecked) {
                        newValues = currentValues.filter(
                          (v) => v !== option.value,
                        );
                      } else {
                        newValues = [...currentValues, option.value];
                      }

                      await handleFilterChange(filter.id, newValues);
                    }}
                  />
                  <span className="checkbox-text">{option.label}</span>
                </label>
              );
            })}
          </div>
        );

      case "range":
        return (
          <div className="range-filter">
            <input
              type="range"
              min={filter.min}
              max={filter.max}
              step={filter.step || 1}
              value={activeFilters[filter.id] || filter.defaultValue}
              onChange={(e) =>
                handleFilterChange(filter.id, parseInt(e.target.value))
              }
            />
            <span className="range-value">
              {activeFilters[filter.id] || filter.defaultValue}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  const resetFilters = useCallback(async () => {
    setIsProcessing(true);
    try {
      setActiveFilters({});
      onFilterChange({});
    } finally {
      setIsProcessing(false);
    }
  }, [onFilterChange]);

  return (
    <div className="filter-panel">
      <div className="filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="filter-title">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Filters</span>
          {Object.keys(activeFilters).length > 0 && (
            <span className="filter-badge">
              {isProcessing ? "..." : Object.keys(activeFilters).length}
            </span>
          )}
        </div>
        <svg
          className={`chevron-icon ${isExpanded ? "expanded" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
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

          {Object.keys(activeFilters).length > 0 && (
            <button
              className="reset-filters-button"
              onClick={resetFilters}
              disabled={isProcessing}
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
