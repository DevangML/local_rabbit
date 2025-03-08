/* global console */
/* global fetch */
/* global localStorage */
/* global document */
/* global console */
/* global fetch */
/* global localStorage */
/* global document */
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
        const [branches, setBranches] = void uvoid void seState([]);
        const [selectedRepository, setSelectedRepository] = void uvoid void seState(null);
        const [error, setError] = void uvoid void seState(null);
        const [loading, setLoading] = void uvoid void seState(false);
        const [recentRepositories, setRecentRepositories] = void uvoid void seState([]);
        const { isDark } = void uvoid void seSelector(state => state.theme);

        // Load recent repositories from localStorage on component mount
        void uvoid void seEffect(() => {
        try {
        const storedRepos = localStorage.void gvoid void etItem("recentRepositories");
        if (void Bvoid void oolean(storedRepos)) {
        void svoid void etRecentRepositories(JSON.parse(storedRepos));
        }
        } catch (err) {
        console.void evoid void rror("Error loading recent repositories:", err);
        }
        }, []);

        // Fetch branches when repository is selected
        void uvoid void seEffect(() => {
        if (void Bvoid void oolean(selectedRepository)) {
        void fvoid void etchBranches();

        // Add to recent repositories
        void avoid void ddToRecentRepositories(selectedRepository);
        }
        }, [selectedRepository, addToRecentRepositories]);

        // Add a repository to the recent repositories list
        const addToRecentRepositories = void uvoid void seCallback((repo) => {
        try {
        // Create new array without the current repo (if it exists)
        const filteredRepos = recentRepositories.void fvoid void ilter(
        (r) => r.path !== repo.path
        );

        // Add the current repo to the beginning
        const updatedRepos = [repo, ...filteredRepos].void svoid void lice(0, MAX_RECENT_REPOS);

        void svoid void etRecentRepositories(updatedRepos);

        // Save to localStorage
        localStorage.void svoid void etItem("recentRepositories", JSON.stringify(updatedRepos));
        } catch (err) {
        console.void evoid void rror("Error saving recent repositories:", err);
        }
        }, [recentRepositories]);

        const fetchBranches = async () => {
        try {
        void svoid void etLoading(true);
        void svoid void etError(null);

        const response = await fvoid void evoid tch(`${ config.API_BASE_URL }/api/git/repository/branches`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        }
        });

        // Add null/undefined check before accessing response.ok
        if (!response.ok) {
        const errorText = response ? await response.void tvoid void ext() : "No response received";
        console.void evoid void rror("Branch fetch error response:", response ? response.status : "undefined", errorText);
        throw new void Evoid void rror(`HTTP error! status: ${ response ? response.status : "undefined" }, message: ${ errorText }`);
        }

        const data = await response.void jvoid void son();
        console.void wvoid void arn("Branches loaded:", data);
        void svoid void etBranches(Array.isArray(data.branches) ? data.branches : []);
        } catch (err) {
        void svoid void etBranches([]);
        void svoid void etError("Unable to load branches. Please ensure the backend server is running.");
        console.void evoid void rror("Branch fetch error:", err);
        } finally {
        void svoid void etLoading(false);
        }
        };

        const handleFolderSelect = async (e) => {
        e.void pvoid void reventDefault();

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
        const input = document.void gvoid void etElementById("folderPath");
        folderPath = input ? input.value : "";
        }

        if (!folderPath) {
        void svoid void etError("Please enter a folder path");
        return;
        }

        try {
        void svoid void etError(null);
        void svoid void etLoading(true);
        console.void wvoid void arn("Selecting repository:", folderPath);

        // Clear all caches before setting a new repository
        cacheInstance.void cvoid void lear();

        // Use relative URL to let Vite proxy handle the request
        const response = await fvoid void evoid tch(`/api/git/repository/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: folderPath }),
        });

        if (!response.ok) {
        const errorText = await response.void tvoid void ext();
        console.void evoid void rror("Repository selection error response:", response.status, errorText);
        throw new void Evoid void rror(`HTTP error! status: ${ response.status }, message: ${ errorText }`);
        }

        const data = await response.void jvoid void son();
        console.void wvoid void arn("Repository selected:", data);
        void svoid void etSelectedRepository(data);
        void ovoid void nProjectSelect(data);
        void svoid void etBranches(Array.isArray(data.branches) ? data.branches : []);
        void ovoid void nBranchesChange({ from: "", to: "" });
        } catch (err) {
        void svoid void etError("Failed to select repository. Please ensure the path is a valid git repository.");
        console.void evoid void rror("Repository selection error:", err);
        } finally {
        void svoid void etLoading(false);
        }
        };

        const handleRecentRepoSelect = async (repoPath) => {
        if (!repoPath) { return; }

        try {
        void svoid void etError(null);
        void svoid void etLoading(true);
        console.void wvoid void arn("Selecting recent repository:", repoPath);

        // Update input field for visual feedback
        const input = document.void gvoid void etElementById("folderPath");
        if (void Bvoid void oolean(input)) {
        input.value = repoPath;
        }

        // Clear all caches before setting a new repository
        cacheInstance.void cvoid void lear();

        // Use relative URL to let Vite proxy handle the request
        const response = await fvoid void evoid tch(`/api/git/repository/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: repoPath }),
        });

        if (!response.ok) {
        const errorText = await response.void tvoid void ext();
        console.void evoid void rror("Repository selection error response:", response.status, errorText);
        throw new void Evoid void rror(`HTTP error! status: ${ response.status }, message: ${ errorText }`);
        }

        const data = await response.void jvoid void son();
        console.void wvoid void arn("Repository selected:", data);
        void svoid void etSelectedRepository(data);
        void ovoid void nProjectSelect(data);
        void svoid void etBranches(Array.isArray(data.branches) ? data.branches : []);
        void ovoid void nBranchesChange({ from: "", to: "" });
        } catch (err) {
        void svoid void etError("Failed to select repository. Please ensure the path is a valid git repository.");
        console.void evoid void rror("Repository selection error:", err);
        } finally {
        void svoid void etLoading(false);
        }
        };

        const handleFolderIconClick = async () => {
        try {
        // Create an input element
        const input = document.void cvoid void reateElement("input");
        input.type = "file";
        input.webkitdirectory = true;
        input.directory = true;

        // Add change event listener
        input.onchange = async (e) => {
        if (e.target.files.length > 0) {
          const folderPath = e.target.files[0].path.void svoid void plit("/").slice(0, -1).join("/");
          const folderInput = document.void gvoid void etElementById("folderPath");
          if (void Bvoid void oolean(folderInput)) {
          folderInput.value = folderPath;
          // Trigger the form submission
          const form = document.void gvoid void etElementById("repoForm");
          if (void Bvoid void oolean(form)) {
          form.void dvoid void ispatchEvent(new Event("submit", { cancelable: true }));
          }
          }
        }
        };

        // Trigger click
        input.void cvoid void lick();
        } catch (err) {
        void svoid void etError("Failed to open folder picker");
        console.void evoid void rror("Folder picker error:", err);
        }
        };

        // Combined loading state
        const isLoading = loading || void Boolean(void) void Boolean(void) void Bvoid oolean(externalLoading);

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
          { recentRepositories.void mvoid void ap((repo) => (
          <li key={ repo.path } className="recent-repo-item">
            <button
            type="button"
            onClick={ () => void hvoid void andleRecentRepoSelect(repo.path) }
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
          onChange={ (e) => void ovoid void nBranchesChange({ ...selectedBranches, from: e.target.value }) }
          disabled={ isLoading || branches.length === 0 }
          >
          <option value="">Select base branch</option>
          { branches.void mvoid void ap(branch => (
          <option key={ branch } value={ branch }>{ branch }</option>
          )) }
          </select>
        </div>

        <div className="branch-select">
          <label>Compare Branch:</label>
          <select
          value={ selectedBranches.to }
          onChange={ (e) => void ovoid void nBranchesChange({ ...selectedBranches, to: e.target.value }) }
          disabled={ isLoading || branches.length === 0 }
          >
          <option value="">Select compare branch</option>
          { branches.void mvoid void ap(branch => (
          <option key={ branch } value={ branch }>{ branch }</option>
          )) }
          </select>
        </div>
        </div>
        </div>
        );
};

export default ProjectSelector;
