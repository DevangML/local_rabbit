/* global document */
/* global document */
/* global document */
/* global document */
import React, { useState, useRef, useEffect } from "react";
import "./DiffSearch.css";

interface Filter {
    diffTypes: string[];
    fileTypes: string[];
    severity: string[];
    status: string[];
    qualityMetrics: string[];
    widgetTypes: string[];
    changeTypes: string[];
}

interface FlutterFilter {
    label: string;
    value: string;
}

interface FlutterFilters {
    fileTypes: FlutterFilter[];
    widgetTypes: FlutterFilter[];
    changeTypes: FlutterFilter[];
}

interface DiffSearchProps {
    onSearch: (params: { query: string; filters: Filter }) => void;
    initialFilters?: Partial<Filter>;
    initialQuery?: string;
}

const PREDEFINED_FILTERS = {
    diffTypes: ["Added", "Modified", "Deleted", "Renamed"],
    fileTypes: ["JavaScript", "TypeScript", "CSS", "HTML", "JSON", "Other"],
    severity: ["High", "Medium", "Low"],
    status: ["Pending", "Reviewed", "Approved", "Rejected"],
    qualityMetrics: ["Complexity", "Coverage", "Duplication", "Style Issues"]
};

const DEFAULT_FILTERS: Filter = {
    diffTypes: [],
    fileTypes: [],
    severity: [],
    status: [],
    qualityMetrics: [],
    widgetTypes: [],
    changeTypes: []
};

const DiffSearch: React.FC<DiffSearchProps> = ({ onSearch, initialFilters = {}, initialQuery = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(initialQuery);
    const [activeFilters, setActiveFilters] = useState<Filter>({ ...DEFAULT_FILTERS, ...initialFilters });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const flutterFilters: FlutterFilters = {
      fileTypes: [
        { label: "Dart Files", value: "DART" },
        { label: "Widget Files", value: "WIDGET" },
        { label: "Screen Files", value: "SCREEN" },
        { label: "Model Files", value: "MODEL" },
        { label: "Service Files", value: "SERVICE" },
        { label: "Test Files", value: "TEST" },
        { label: "Other", value: "OTHER" }
      ],
      widgetTypes: [
        { label: "Stateless Widgets", value: "STATELESS" },
        { label: "Stateful Widgets", value: "STATEFUL" },
        { label: "BLoC Components", value: "BLOC" },
        { label: "Provider Components", value: "PROVIDER" }
      ],
      changeTypes: [
        { label: "UI Changes", value: "UI" },
        { label: "Logic Changes", value: "LOGIC" },
        { label: "State Management", value: "STATE" },
        { label: "Dependencies", value: "DEPENDENCIES" }
      ]
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e?: React.FormEvent) => {
        e.preventDefault();
        onSearch({ query, filters: activeFilters });
        setIsOpen(false);
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          handleSubmit(e);
        } else if (e.key === "Escape") {
          setIsOpen(false);
          if (searchInputRef.current) {
            searchInputRef.current.blur();
          }
        }
    };

    const handleFilterChange = (category: keyof Filter, value: string) => {
        setActiveFilters(prev => ({
          ...prev,
          [category]: prev[category].includes(value)
            ? prev[category].filter(item => item !== value)
            : [...(prev[category] || []), value]
        }));
    };

    const toggleFilter = (category: keyof Filter, value: string) => {
        setActiveFilters(prev => {
          const current = prev[category] || [];
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
        setQuery("");
        handleSubmit();
    };

    const getActiveFilterCount = (): number => {
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
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
                  <h4>{category.replace(/([A-Z])/g, " $1").trim()}</h4>
                  <div className="filter-options">
                    {options.map(option => (
                      <label key={option} className="filter-option">
                        <input
                          type="checkbox"
                          checked={isFilterActive(category as keyof Filter, option)}
                          onChange={() => handleFilterChange(category as keyof Filter, option)}
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
                      {category.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="filter-options">
                      {options.map(({ label, value }) => (
                        <button
                          key={value}
                          className={`filter-option ${isFilterActive(category as keyof Filter, value) ? "active" : ""}`}
                          onClick={() => toggleFilter(category as keyof Filter, value)}
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