import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';

/**
 * Diff analyzer component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Component
 */
const DiffAnalyzer = ({ fromBranch, toBranch }) => {
  const { analyzeDiff, loading, error } = useAppContext();
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  /**
   * Analyze diff between branches
   */
  const handleAnalyzeDiff = async () => {
    if (!fromBranch || !toBranch) {
      return;
    }

    try {
      setAnalyzing(true);
      const analysisData = await analyzeDiff(fromBranch, toBranch);
      setAnalysis(analysisData);
    } catch (err) {
      console.error('Error analyzing diff:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!fromBranch || !toBranch) {
    return (
      <div className="diff-analyzer empty">
        <p>Please select both branches to analyze diff</p>
      </div>
    );
  }

  return (
    <div className="diff-analyzer">
      <h2>Diff Analysis</h2>
      
      {/* Analysis button */}
      <div className="analyzer-actions">
        <button 
          onClick={handleAnalyzeDiff} 
          disabled={analyzing || loading}
          className="analyze-button"
        >
          {analyzing ? 'Analyzing...' : 'Analyze Changes'}
        </button>
      </div>
      
      {/* Error message */}
      {error && !analysis && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
      
      {/* Analysis results */}
      {analysis && (
        <div className="analysis-results">
          <h3>Analysis Results</h3>
          
          {/* Summary */}
          <div className="analysis-summary">
            <h4>Summary</h4>
            <p>{analysis.summary || 'No summary available'}</p>
          </div>
          
          {/* Complexity changes */}
          {analysis.complexity && (
            <div className="analysis-complexity">
              <h4>Complexity Changes</h4>
              <div className="complexity-metrics">
                <div className="metric">
                  <span className="metric-label">Overall Complexity Change:</span>
                  <span className={`metric-value ${analysis.complexity.overall > 0 ? 'increased' : 'decreased'}`}>
                    {analysis.complexity.overall > 0 ? '+' : ''}{analysis.complexity.overall}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Files with Increased Complexity:</span>
                  <span className="metric-value">{analysis.complexity.filesIncreased || 0}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Files with Decreased Complexity:</span>
                  <span className="metric-value">{analysis.complexity.filesDecreased || 0}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Potential issues */}
          {analysis.issues && analysis.issues.length > 0 && (
            <div className="analysis-issues">
              <h4>Potential Issues</h4>
              <ul className="issues-list">
                {analysis.issues.map((issue, index) => (
                  <li key={index} className={`issue-item ${issue.severity}`}>
                    <div className="issue-header">
                      <span className="issue-severity">{issue.severity}</span>
                      <span className="issue-title">{issue.title}</span>
                    </div>
                    <p className="issue-description">{issue.description}</p>
                    {issue.location && (
                      <div className="issue-location">
                        <span className="location-file">{issue.location.file}</span>
                        {issue.location.line && (
                          <span className="location-line">Line: {issue.location.line}</span>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="analysis-recommendations">
              <h4>Recommendations</h4>
              <ul className="recommendations-list">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="recommendation-item">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* No analysis yet */}
      {!analysis && !analyzing && (
        <div className="no-analysis">
          <p>Click the "Analyze Changes" button to analyze the diff between branches.</p>
        </div>
      )}
      
      {/* Loading state */}
      {analyzing && (
        <div className="analyzing-indicator">
          <p>Analyzing changes between {fromBranch} and {toBranch}...</p>
          <div className="loading-spinner"></div>
          <p className="analyzing-note">This may take a moment depending on the size of the diff.</p>
        </div>
      )}
    </div>
  );
};

export default DiffAnalyzer; 