import React, { useState } from 'react';
import './AIAnalyzer.css';
import codeReviewApiService from '../infrastructure/api/services/CodeReviewApiService';

/**
 * AI Analyzer component that uses Gemini API to provide intelligent code review
 * for pull requests. It analyzes code changes between branches and provides
 * detailed feedback, suggestions, and quality metrics.
 */
const AIAnalyzer = ({
  fromBranch,
  toBranch,
  branches,
  onFromBranchChange,
  onToBranchChange,
  isLoadingBranches,
  repoPath,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [analysisPrompt, setAnalysisPrompt] = useState(
    "Analyze code changes for potential bugs, performance issues, and best practices"
  );

  // Run the AI-powered code analysis
  const runAnalysis = async () => {
    if (!repoPath || !fromBranch || !toBranch) {
      setError('Please select a repository and both branches');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First select the repository
      await codeReviewApiService.selectRepository(repoPath);

      // Then analyze the diff between branches
      const results = await codeReviewApiService.analyzeDiff(
        fromBranch,
        toBranch,
        analysisPrompt
      );

      setAnalysisResults(results);
    } catch (error) {
      console.error('Error analyzing code:', error);
      // Check for API key related errors
      if (error.includes('API key') || error.includes('Gemini API')) {
        setError(
          'Gemini API key is missing or invalid. Please add a valid API key in the server .env file. ' +
          'You can get a key from https://ai.google.dev/'
        );
      } else {
        setError(error || 'Failed to analyze code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderSeverityBadge = (severity) => {
    const classes = `severity-badge severity-${severity}`;
    return <span className={classes}>{severity}</span>;
  };

  // Render branch selector
  const renderBranchSelector = () => (
    <div className="branch-selector">
      <h4>Select Branches to Compare</h4>
      <div className="branch-selectors">
        <div className="branch-select">
          <label>Base (main) branch:</label>
          <select
            value={fromBranch}
            onChange={(e) => onFromBranchChange(e.target.value)}
            disabled={isLoadingBranches}
          >
            <option value="">-- Select Base Branch --</option>
            {branches.map(branch => (
              <option key={`base-${branch}`} value={branch}>{branch}</option>
            ))}
          </select>
        </div>

        <div className="branch-select">
          <label>Head (feature) branch:</label>
          <select
            value={toBranch}
            onChange={(e) => onToBranchChange(e.target.value)}
            disabled={isLoadingBranches}
          >
            <option value="">-- Select Head Branch --</option>
            {branches.map(branch => (
              <option key={`head-${branch}`} value={branch}>{branch}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Render analysis results
  const renderAnalysisResults = () => {
    if (!analysisResults) return null;

    const { summary, files } = analysisResults;

    return (
      <div className="analysis-results">
        <div className="results-summary">
          <h4>Summary</h4>
          <div className="summary-info">
            <p><strong>Quality:</strong> {summary.overallQuality}</p>
            <p><strong>Files Analyzed:</strong> {summary.filesAnalyzed}</p>
            <p><strong>Total Issues:</strong> {summary.issueCount.total}</p>
          </div>

          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">{summary.issueCount.high || 0}</span>
              <span className="stat-label">{renderSeverityBadge('high')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{summary.issueCount.medium || 0}</span>
              <span className="stat-label">{renderSeverityBadge('medium')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{summary.issueCount.low || 0}</span>
              <span className="stat-label">{renderSeverityBadge('low')}</span>
            </div>
          </div>

          {summary.topIssues && summary.topIssues.length > 0 && (
            <div className="top-issues">
              <h5>Top Issues</h5>
              <ul className="issues-list">
                {summary.topIssues.map((issue, index) => (
                  <li key={index} className="issue-item">
                    <span className="issue-file">{issue.file}</span>
                    <span className="issue-title">{issue.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="files-analysis">
          <h4>Files Analysis</h4>
          {files.map((file, index) => (
            <div key={index} className="file-analysis">
              <div className="file-header">
                <span className="file-path">{file.path}</span>
                <span className="file-type">{file.type}</span>
              </div>

              {file.issues && file.issues.length > 0 ? (
                <>
                  <h5>Issues</h5>
                  <ul className="file-issues">
                    {file.issues.map((issue, idx) => (
                      <li key={idx} className={`issue-item severity-border-${issue.severity}`}>
                        <div className="issue-header">
                          <span className="issue-title">{issue.title}</span>
                          {renderSeverityBadge(issue.severity)}
                          {issue.line && <span className="issue-line">Line: {issue.line}</span>}
                        </div>
                        <p className="issue-description">{issue.description}</p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="no-issues">No issues found</p>
              )}

              {file.suggestions && file.suggestions.length > 0 && (
                <>
                  <h5>Suggestions</h5>
                  <ul className="file-suggestions">
                    {file.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="suggestion-item">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-analyzer">
      <div className="analyzer-header">
        <h3>AI Code Review</h3>
        <p className="analyzer-subtitle">
          Intelligent code analysis powered by Gemini AI
        </p>
      </div>

      {renderBranchSelector()}

      <div className="prompt-section">
        <label htmlFor="analysis-prompt">Analysis Prompt:</label>
        <textarea
          id="analysis-prompt"
          className="prompt-input"
          value={analysisPrompt}
          onChange={(e) => setAnalysisPrompt(e.target.value)}
          rows={2}
          placeholder="What would you like the AI to focus on in this review?"
        />
        <button
          className="analyze-button"
          onClick={runAnalysis}
          disabled={isLoading || !repoPath || !fromBranch || !toBranch}
        >
          {isLoading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="loading-animation">
          <div className="spinner"></div>
          <p>Analyzing code changes using AI. This may take a few moments...</p>
        </div>
      )}

      {renderAnalysisResults()}
    </div>
  );
};

export default AIAnalyzer;