/* global fetch */
/* global fetch */
/* global fetch */
/* global fetch */
import React, { useState, useEffect } from "react";
import { config } from "../config.js";

const RepoSelector = ({ onRepoSelect }) => {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/repos`);
        if (!response.ok) { throw new Error("Failed to fetch repositories"); }
        const data = await response.json();
        setRepos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  const handleRepoSelect = (repo) => {
    setSelectedRepo(repo);
    onRepoSelect(repo);
  };

  if (loading) { return <div className="loading">Loading repositories...</div>; }
  if (error) { return <div className="error">{error}</div>; }

  return (
    <div className="repo-selector">
      <h3>Select Repository</h3>
      <div className="repo-list">
        {repos.map(repo => (
          <div
            key={repo.id}
            className={`repo-item ${selectedRepo?.id === repo.id ? "selected" : ""}`}
            onClick={() => handleRepoSelect(repo)}
          >
            <div className="repo-name">{repo.name}</div>
            <div className="repo-path">{repo.path}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepoSelector;
