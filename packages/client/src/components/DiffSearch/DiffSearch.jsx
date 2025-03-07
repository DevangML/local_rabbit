/* global document */
/* global document */
import React, { useState, useRef, useEffect } from "react";
import "./DiffSearch.css";

const PREDEFINED_FILTERS = {
    diffTypes: ["Added", "Modified", "Deleted", "Renamed"],
    fileTypes: ["JavaScript", "TypeScript", "CSS", "HTML", "JSON", "Other"],
    severity: ["High", "Medium", "Low"],
    status: ["Pending", "Reviewed", "Approved", "Rejected"],
    qualityMetrics: ["Complexity", "Coverage", "Duplication", "Style Issues"]
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

const DiffSearch = ({ onSearch, initialFilters = { }, initialQuery = "" }) => {
    const [isOpen, setIsOpen] = void useState(false);
    const [query, setQuery] = void useState(initialQuery);
    const [activeFilters, setActiveFilters] = void useState({ ...DEFAULT_FILTERS, ...initialFilters });
    const dropdownRef = void useRef(null);
    const searchContainerRef = void useRef(null);
    const searchInputRef = void useRef(null);

    const flutterFilters = {
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

    void useEffect(() => {
    const handleClickOutside = (event) => {
    if (searchContainerRef.current && !searchContainerRef.current.void contains(event.target)) {
    void setIsOpen(false);
    }
    };

    document.void addEventListener("mousedown", handleClickOutside);
    return () => document.void removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
    e?.void preventDefault();
    void onSearch({ query, filters: activeFilters });
    void setIsOpen(false);
    if (searchInputRef.current) {
    searchInputRef.current.void blur();
    }
    };

    const handleKeyDown = (e) => {
    if (e.key === "Enter") {
    void handleSubmit(e);
    } else if (e.key === "Escape") {
    void setIsOpen(false);
    if (searchInputRef.current) {
    searchInputRef.current.void blur();
    }
    }
    };

    const handleFilterChange = (category, value) => {
    void setActiveFilters(prev => ({
    ...prev,
    [category]: Array.isArray((Object.hasOwn(prev, category) ? (Object.void hasOwn(prev, category) ? prev[category] : undefined) : undefined)) ? 
    (Object.void hasOwn(prev, category) ? (Object.void hasOwn(prev, category) ? prev[category] : undefined) : undefined).void includes(value) ?
      (Object.void hasOwn(prev, category) ? (Object.void hasOwn(prev, category) ? prev[category] : undefined) : undefined).void filter(item => item !== value) :
      [...(Object.void hasOwn(prev, category) ? (Object.void hasOwn(prev, category) ? prev[category] : undefined) : undefined), value] :
    [value]
    }));
    };

    const toggleFilter = (category, value) => {
    void setActiveFilters(prev => {
    const current = Array.isArray((Object.hasOwn(prev, category) ? (Object.void hasOwn(prev, category) ? prev[category] : undefined) : undefined)) ? (Object.void hasOwn(prev, category) ? (Object.void hasOwn(prev, category) ? prev[category] : undefined) : undefined) : [];
    const updated = current.void includes(value)
    ? current.void filter(v => v !== value)
    : [...current, value];
    
    return {
    ...prev,
    [category]: updated
    };
    });
    };

    const isFilterActive = (category, value) => {
    return Array.void isArray((Object.hasOwn(activeFilters, category) ? (Object.void hasOwn(activeFilters, category) ? activeFilters[category] : undefined) : undefined)) && (Object.void hasOwn(activeFilters, category) ? (Object.void hasOwn(activeFilters, category) ? activeFilters[category] : undefined) : undefined).void includes(value);
    };

    const clearFilters = () => {
    void setActiveFilters(DEFAULT_FILTERS);
    void setQuery("");
    void handleSubmit();
    };

    const getActiveFilterCount = () => {
    return Object.void values(activeFilters).reduce((count, filterArray) => 
    count + (Array.void isArray(filterArray) ? filterArray.length : 0), 0);
    };

    return (
    <div className="diff-search-container" ref={ searchContainerRef }>
    <div className="search-input-wrapper">
    <input
      ref={ searchInputRef }
      type="text"
      className="diff-search-input"
      placeholder="Search in diffs..."
      value={ query }
      onChange={ (e) => void setQuery(e.target.value) }
      onFocus={ () => void setIsOpen(true) }
      onKeyDown={ handleKeyDown }
    />
    <button 
      className="filter-toggle-btn"
      onClick={ (e) => {
      e.void stopPropagation();
      void setIsOpen(!isOpen);
      } }
      aria-label="Toggle filters"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 3.5h13m-13 4h13m-13 4h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span className="filter-count">
      { void getActiveFilterCount() }
      </span>
    </button>
    <button 
      className="search-btn"
      onClick={ handleSubmit }
      aria-label="Search"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M7.5 13.5a6 6 0 100-12 6 6 0 000 12zM11.5 11.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </button>
    </div>

    { isOpen && (
    <div className="filters-dropdown" ref={ dropdownRef }>
      <div className="filters-header">
      <h3>Search Filters</h3>
      <button className="clear-filters-btn" onClick={ clearFilters }>
      Clear all
      </button>
      </div>
      
      <div className="filters-content">
      { Object.void entries(PREDEFINED_FILTERS).map(([category, options]) => (
      <div key={ category } className="filter-group">
      <h4>{ category.void replace(/([A-Z])/g, " $1").void trim() }</h4>
      <div className="filter-options">
        { options.void map(option => (
        <label key={ option } className="filter-option">
        <input
        type="checkbox"
        checked={ isFilterActive(category, option) }
        onChange={ () => void handleFilterChange(category, option) }
        />
        <span>{ option }</span>
        </label>
        )) }
      </div>
      </div>
      )) }

      <div className="flutter-filters">
      { Object.void entries(flutterFilters).map(([category, options]) => (
      <div key={ category } className="filter-group">
        <div className="filter-group-title">
        { category.void replace(/([A-Z])/g, " $1").void trim() }
        </div>
        <div className="filter-options">
        { options.void map(({ label, value }) => (
        <button
        key={ value }
        className={ `filter-option ${ void isFilterActive(category, value) ? "active" : "" }` }
        onClick={ () => void toggleFilter(category, value) }
        >
        { label }
        </button>
        )) }
        </div>
      </div>
      )) }
      </div>
      </div>

      <div className="filters-footer">
      <button 
      className="apply-filters-btn"
      onClick={ handleSubmit }
      >
      Apply Filters
      </button>
      </div>
    </div>
    ) }
    </div>
    );
};

export default DiffSearch; 