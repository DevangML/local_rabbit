import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';

/**
 * AI analyzer component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Component
 */
const AIAnalyzer = ({ fromBranch, toBranch }) => {
  const { 
    analyzeDiffWithAI, 
    aiAnalysis, 
    aiError, 
    loading, 
    isAiEnabled,
    clearAiAnalysis
  } = useAppContext();
  
  const { addToast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPartialDataWarning, setShowPartialDataWarning] = useState(false);

  // Show toast when AI error occurs
  useEffect(() => {
    if (aiError) {
      addToast(aiError, 'error');
    }
  }, [aiError, addToast]);

  // Show toast when partial data is received
  useEffect(() => {
    if (showPartialDataWarning && aiAnalysis && aiAnalysis.partial) {
      addToast(
        'Some requested information could not be retrieved. The analysis may be incomplete.',
        'warning',
        8000
      );
    }
  }, [showPartialDataWarning, aiAnalysis, addToast]);

  /**
   * Handle prompt change
   * @param {Object} event - Event object
   */
  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  /**
   * Handle form submission
   * @param {Object} event - Event object
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!prompt.trim() || !fromBranch || !toBranch) {
      return;
    }
    
    try {
      setIsAnalyzing(true);
      setShowPartialDataWarning(false);
      const result = await analyzeDiffWithAI(fromBranch, toBranch, prompt.trim());
      
      // Check if we got partial data
      if (result && result.partial) {
        setShowPartialDataWarning(true);
      } else {
        // Success toast
        addToast('AI analysis completed successfully', 'success');
      }
    } catch (error) {
      console.error('Error in AI analysis:', error);
      // Error is already handled by the context and shown via useEffect
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Handle clearing the analysis
   */
  const handleClear = () => {
    clearAiAnalysis();
    setShowPartialDataWarning(false);
  };

  if (!isAiEnabled) {
    return (
      <div className="ai-analyzer disabled">
        <h2>AI Analysis</h2>
        <div className="ai-disabled-message">
          <p>AI features are currently disabled. Please check your configuration.</p>
          <ul>
            <li>Make sure you have set the VITE_GEMINI_API_KEY in your .env file</li>
            <li>Ensure VITE_ENABLE_AI_FEATURES is set to 'true'</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!fromBranch || !toBranch) {
    return (
      <div className="ai-analyzer empty">
        <h2>AI Analysis</h2>
        <p>Please select both branches to use AI analysis</p>
      </div>
    );
  }

  return (
    <div className="ai-analyzer">
      <h2>AI Analysis</h2>
      
      {/* Prompt form */}
      <form onSubmit={handleSubmit} className="ai-prompt-form">
        <div className="form-group">
          <label htmlFor="ai-prompt">What would you like to know about this diff?</label>
          <textarea
            id="ai-prompt"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="E.g., 'Analyze this diff for security issues' or 'Explain what changed in this PR'"
            rows={3}
            disabled={loading || isAnalyzing}
          />
        </div>
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading || isAnalyzing || !prompt.trim()}
            className="analyze-button"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
          </button>
          {aiAnalysis && (
            <button 
              type="button" 
              onClick={handleClear}
              className="clear-button"
            >
              Clear Analysis
            </button>
          )}
        </div>
      </form>
      
      {/* Partial data warning */}
      {showPartialDataWarning && (
        <div className="partial-data-warning">
          <p>
            <strong>Note:</strong> Some requested information could not be retrieved. 
            The analysis may be incomplete.
          </p>
          {aiAnalysis && aiAnalysis.missingFields && aiAnalysis.missingFields.length > 0 && (
            <p>Missing information: {aiAnalysis.missingFields.join(', ')}</p>
          )}
        </div>
      )}
      
      {/* Error message */}
      {aiError && (
        <div className="ai-error-message">
          <p>Error: {aiError}</p>
        </div>
      )}
      
      {/* Analysis results */}
      {aiAnalysis && !aiAnalysis.partial && (
        <div className="ai-analysis-results">
          <h3>Analysis Results</h3>
          
          {/* Summary */}
          <div className="ai-analysis-summary">
            <h4>Summary</h4>
            <p>{aiAnalysis.summary || 'No summary available'}</p>
            <div className={`severity-badge ${aiAnalysis.severity}`}>
              {aiAnalysis.severity?.toUpperCase() || 'UNKNOWN'} SEVERITY
            </div>
          </div>
          
          {/* Issues */}
          {aiAnalysis.issues && aiAnalysis.issues.length > 0 && (
            <div className="ai-analysis-issues">
              <h4>Issues</h4>
              <ul className="issues-list">
                {aiAnalysis.issues.map((issue, index) => (
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
          
          {/* Complexity */}
          {aiAnalysis.complexity && (
            <div className="ai-analysis-complexity">
              <h4>Complexity Changes</h4>
              <div className="complexity-metrics">
                <div className="metric">
                  <span className="metric-label">Overall Complexity Change:</span>
                  <span className={`metric-value ${parseFloat(aiAnalysis.complexity.overall) > 0 ? 'increased' : 'decreased'}`}>
                    {parseFloat(aiAnalysis.complexity.overall) > 0 ? '+' : ''}{aiAnalysis.complexity.overall}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Files with Increased Complexity:</span>
                  <span className="metric-value">{aiAnalysis.complexity.filesIncreased || 0}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Files with Decreased Complexity:</span>
                  <span className="metric-value">{aiAnalysis.complexity.filesDecreased || 0}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Recommendations */}
          {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
            <div className="ai-analysis-recommendations">
              <h4>Recommendations</h4>
              <ul className="recommendations-list">
                {aiAnalysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="recommendation-item">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Loading state */}
      {isAnalyzing && (
        <div className="ai-analyzing-indicator">
          <p>Analyzing changes between {fromBranch} and {toBranch}...</p>
          <div className="loading-spinner"></div>
          <p className="analyzing-note">This may take a moment as we process your request.</p>
        </div>
      )}
    </div>
  );
};

export default AIAnalyzer; 