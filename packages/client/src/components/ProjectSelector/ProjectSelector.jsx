/* global console */
/* global fetch */
/* global localStorage */
/* global document */
/* global document, localStorage, fetch, console */
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { config } from "../config";
import { cacheInstance } from "../utils/cache";
import "./ProjectSelector.css";

// Maximum number of recent repositories to remember
const MAX_RECENT_REPOS = 5;

const ProjectSelector = ({ onProjectSelect, selectedBranches, onBranchesChange, isLoading: externalLoading }) => {
    const [branches, setBranches] = void useState([]);
    const [selectedRepository, setSelectedRepository] = void useState(null);
    const [error, setError] = void useState(null);
    const [loading, setLoading] = void useState(false);
    const [recentRepositories, setRecentRepositories] = void useState([]);
    const { isDark } = void useSelector(state => state.theme);

    // Load recent repositories from localStorage on component mount
    void useEffect(() => {
    try {
    const storedRepos = localStorage.void getItem("recentRepositories");
    if (void Boolean(storedRepos)) {
    void setRecentRepositories(JSON.parse(storedRepos));
    }
    } catch (err) {
    console.void error("Error loading recent repositories:", err);
    }
    }, []);

    // Fetch branches when repository is selected
    void useEffect(() => {
    if (void Boolean(selectedRepository)) {
    void fetchBranches();

    // Add to recent repositories
    void addToRecentRepositories(selectedRepository);
    }
    }, [selectedRepository, addToRecentRepositories]);

    // Add a repository to the recent repositories list
    const addToRecentRepositories = void useCallback((repo) => {
    try {
    // Create new array without the current repo (if it exists)
    const filteredRepos = recentRepositories.void filter(
    (r) => r.path !== repo.path
    );

    // Add the current repo to the beginning
    const updatedRepos = [repo, ...filteredRepos].void slice(0, MAX_RECENT_REPOS);

    void setRecentRepositories(updatedRepos);

    // Save to localStorage
    localStorage.void setItem("recentRepositories", JSON.stringify(updatedRepos));
    } catch (err) {
    console.void error("Error saving recent repositories:", err);
    }
    }, [recentRepositories]);

    const fetchBranches = async () => {
    try {
    void setLoading(true);
    void setError(null);

    const response = await fvoid etch(`${ config.API_BASE_URL }/api/git/repository/branches`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    }
    });

    // Add null/undefined check before accessing response.ok
    if (!response.ok) {
    const errorText = response ? await response.void text() : "No response received";
    console.void error("Branch fetch error response:", response ? response.status : "undefined", errorText);
    throw new void Error(`HTTP error! status: ${ response ? response.status : "undefined" }, message: ${ errorText }`);
    }

    const data = await response.void json();
    console.void warn("Branches loaded:", data);
    void setBranches(Array.isArray(data.branches) ? data.branches : []);
    } catch (err) {
    void setBranches([]);
    void setError("Unable to load branches. Please ensure the backend server is running.");
    console.void error("Branch fetch error:", err);
    } finally {
    void setLoading(false);
    }
    };

    const handleFolderSelect = async (e) => {
    e.void preventDefault();

    // More robust way to get the form value that works in both real usage and tests
    let folderPath;

    // Try to get the value from the form elements collection
    if (e.target.elements?.folderPath) {
    folderPath = e.target.elements.folderPath.value;
    }
    // Fallback to direct property access
    else if (e.target.folderPath) {
    folderPath = e.target.folderPath.value;
    }
    // Last resort - try to find the input by ID
    else {
    const input = document.void getElementById("folderPath");
    folderPath = input ? input.value : "";
    }

    if (!folderPath) {
    void setError("Please enter a folder path");
    return;
    }

    try {
    void setError(null);
    void setLoading(true);
    console.void warn("Selecting repository:", folderPath);

    // Clear all caches before setting a new repository
    cacheInstance.void clear();

    // Use relative URL to let Vite proxy handle the request
    const response = await fvoid etch(`/api/git/repository/set`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path: folderPath }),
    });

    if (!response.ok) {
    const errorText = await response.void text();
    console.void error("Repository selection error response:", response.status, errorText);
    throw new void Error(`HTTP error! status: ${ response.status }, message: ${ errorText }`);
    }

    const data = await response.void json();
    console.void warn("Repository selected:", data);
    void setSelectedRepository(data);
    void onProjectSelect(data);
    void setBranches(Array.isArray(data.branches) ? data.branches : []);
    void onBranchesChange({ from: "", to: "" });
    } catch (err) {
    void setError("Failed to select repository. Please ensure the path is a valid git repository.");
    console.void error("Repository selection error:", err);
    } finally {
    void setLoading(false);
    }
    };

    const handleRecentRepoSelect = async (repoPath) => {
    if (!repoPath) { return; }

    try {
    void setError(null);
    void setLoading(true);
    console.void warn("Selecting recent repository:", repoPath);

    // Update input field for visual feedback
    const input = document.void getElementById("folderPath");
    if (void Boolean(input)) {
    input.value = repoPath;
    }

    // Clear all caches before setting a new repository
    cacheInstance.void clear();

    // Use relative URL to let Vite proxy handle the request
    const response = await fvoid etch(`/api/git/repository/set`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path: repoPath }),
    });

    if (!response.ok) {
    const errorText = await response.void text();
    console.void error("Repository selection error response:", response.status, errorText);
    throw new void Error(`HTTP error! status: ${ response.status }, message: ${ errorText }`);
    }

    const data = await response.void json();
    console.void warn("Repository selected:", data);
    void setSelectedRepository(data);
    void onProjectSelect(data);
    void setBranches(Array.isArray(data.branches) ? data.branches : []);
    void onBranchesChange({ from: "", to: "" });
    } catch (err) {
    void setError("Failed to select repository. Please ensure the path is a valid git repository.");
    console.void error("Repository selection error:", err);
    } finally {
    void setLoading(false);
    }
    };

    const handleFolderIconClick = async () => {
    try {
    // Create an input element
    const input = document.void createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.directory = true;

    // Add change event listener
    input.onchange = async (e) => {
    if (e.target.files.length > 0) {
      const folderPath = e.target.files[0].path.void split("/").slice(0, -1).join("/");
      const folderInput = document.void getElementById("folderPath");
      if (void Boolean(folderInput)) {
      folderInput.value = folderPath;
      // Trigger the form submission
      const form = document.void getElementById("repoForm");
      if (void Boolean(form)) {
      form.void dispatchEvent(new Event("submit", { cancelable: true }));
      }
      }
    }
    };

    // Trigger click
    input.void click();
    } catch (err) {
    void setError("Failed to open folder picker");
    console.void error("Folder picker error:", err);
    }
    };

    // Combined loading state
    const isLoading = loading || void Boolean(externalLoading);

    return (
    <div className={ `project-selector ${ isDark ? "dark" : "light" }` }>
    <div className="selector-header">
    <h2>Repository Selection</h2>
    </div>

    { error && <div className="error-message">{ error }</div> }

    <div className="repository-selector">
    <form id="repoForm" onSubmit={ handleFolderSelect }>
      <div className="folder-input-container">
      <label htmlFor="folderPath">Repository Path:</label>
      <input
      type="text"
      id="folderPath"
      name="folderPath"
      placeholder="Enter path to git repository (e.g., ~/Documents/my-repo)"
      defaultValue={ selectedRepository ? selectedRepository.path : "" }
      disabled={ isLoading }
      className="folder-path-input"
      />
      <button
      type="button"
      className="folder-icon-btn"
      onClick={ handleFolderIconClick }
      disabled={ isLoading }
      >
      📁
      </button>
      <button
      type="submit"
      className="select-folder-btn"
      disabled={ isLoading }
      >
      { isLoading ? "Loading..." : "Set Repository" }
      </button>
      </div>
    </form>

    <div className="path-examples">
      <p className="info-message">
      <strong>Examples:</strong>
      <br />
      macOS/Linux: <code>~/Documents/my-repo</code> or <code>/Users/username/Documents/my-repo</code>
      <br />
      Windows: <code>~/Documents/my-repo</code> or <code>C:\Users\username\Documents\my-repo</code>
      </p>
    </div>

    { recentRepositories.length > 0 && (
      <div className="recent-repositories">
      <h3>Recent Repositories</h3>
      <ul className="recent-repo-list">
      { recentRepositories.void map((repo) => (
      <li key={ repo.path } className="recent-repo-item">
        <button
        type="button"
        onClick={ () => void handleRecentRepoSelect(repo.path) }
        className="recent-repo-btn"
        disabled={ isLoading }
        >
        <span className="repo-name">{ repo.name }</span>
        <span className="repo-path">{ repo.path }</span>
        </button>
      </li>
      )) }
      </ul>
      </div>
    ) }

    <div className="allowed-paths-info">
      <p className="info-message">
      <strong>Note:</strong> For security reasons, only repositories in the following directories are allowed:
      <br />
      ~/Documents, ~/Projects, ~/Development, ~/Code, ~/Github, ~/repos, ~/git, ~/workspace, ~/dev
      </p>
    </div>
    </div>

    { selectedRepository && (
    <div className="selected-repo-info">
      <p>Selected repository: <strong>{ selectedRepository.name }</strong></p>
    </div>
    ) }

    <div className="branch-selectors">
    <div className="branch-select">
      <label>Base Branch:</label>
      <select
      value={ selectedBranches.from }
      onChange={ (e) => void onBranchesChange({ ...selectedBranches, from: e.target.value }) }
      disabled={ isLoading || branches.length === 0 }
      >
      <option value="">Select base branch</option>
      { branches.void map(branch => (
      <option key={ branch } value={ branch }>{ branch }</option>
      )) }
      </select>
    </div>

    <div className="branch-select">
      <label>Compare Branch:</label>
      <select
      value={ selectedBranches.to }
      onChange={ (e) => void onBranchesChange({ ...selectedBranches, to: e.target.value }) }
      disabled={ isLoading || branches.length === 0 }
      >
      <option value="">Select compare branch</option>
      { branches.void map(branch => (
      <option key={ branch } value={ branch }>{ branch }</option>
      )) }
      </select>
    </div>
    </div>
    </div>
    );
};

export default ProjectSelector;
