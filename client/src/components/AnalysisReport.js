import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import './AnalysisReport.css';

const AnalysisReport = ({ fromBranch, toBranch }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fromBranch && toBranch) {
      fetchAnalysis();
    }
  }, [fromBranch, toBranch]);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analyze/flutter?fromBranch=${fromBranch}&toBranch=${toBranch}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze Flutter changes');
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSummary = () => {
    const { summary } = analysisData;
    return (
      <div className="analysis-summary">
        <h3>Changes Overview</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Files Changed</span>
            <span className="summary-value">{summary.totalFiles}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Lines Added</span>
            <span className="summary-value additions">+{summary.totalAdditions}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Lines Removed</span>
            <span className="summary-value deletions">-{summary.totalDeletions}</span>
          </div>
        </div>

        <div className="file-types">
          <h4>Changes by Type</h4>
          <div className="type-grid">
            {Object.entries(summary.byType).map(([type, count]) => (
              <div key={type} className="type-item">
                <span className="type-label">{type}</span>
                <span className="type-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="state-management">
          <h4>State Management</h4>
          <div className="state-grid">
            <div className="state-item">
              <span className="state-label">Stateful Widgets</span>
              <span className="state-count">{summary.stateManagement.stateful}</span>
            </div>
            <div className="state-item">
              <span className="state-label">Stateless Widgets</span>
              <span className="state-count">{summary.stateManagement.stateless}</span>
            </div>
            <div className="state-item">
              <span className="state-label">BLoC Usage</span>
              <span className="state-count">{summary.stateManagement.bloc}</span>
            </div>
            <div className="state-item">
              <span className="state-label">Provider Usage</span>
              <span className="state-count">{summary.stateManagement.provider}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFileChanges = () => {
    return (
      <div className="file-changes">
        <h3>Changed Files</h3>
        {analysisData.files.map((file, index) => (
          <div key={index} className="file-card">
            <div className="file-header">
              <div className="file-info">
                <span className="file-type">{file.type}</span>
                <span className="file-path">{file.path}</span>
              </div>
              <div className="file-stats">
                <span className="additions">+{file.additions}</span>
                <span className="deletions">-{file.deletions}</span>
              </div>
            </div>

            {file.analysis && (
              <div className="file-analysis">
                {file.analysis.widgets.length > 0 && (
                  <div className="analysis-item">
                    <span className="analysis-label">Widget Type:</span>
                    <span className="analysis-value">{file.analysis.widgets.join(', ')}</span>
                  </div>
                )}

                {file.analysis.stateManagement.isStateful && (
                  <div className="analysis-item">
                    <span className="analysis-label">State Variables:</span>
                    <span className="analysis-value">{file.analysis.complexity.stateVariables}</span>
                  </div>
                )}

                {(file.analysis.stateManagement.usesBloc || file.analysis.stateManagement.usesProvider) && (
                  <div className="analysis-item">
                    <span className="analysis-label">State Management:</span>
                    <div className="state-tags">
                      {file.analysis.stateManagement.usesBloc && (
                        <span className="state-tag bloc">BLoC</span>
                      )}
                      {file.analysis.stateManagement.usesProvider && (
                        <span className="state-tag provider">Provider</span>
                      )}
                    </div>
                  </div>
                )}

                {file.analysis.complexity.widgetNesting > 3 && (
                  <div className="analysis-warning">
                    <span className="warning-icon">⚠️</span>
                    High widget nesting detected ({file.analysis.complexity.widgetNesting} levels)
                  </div>
                )}
              </div>
            )}

            <div className="file-changes-preview">
              {file.changes.slice(0, 5).map((change, i) => (
                <pre key={i} className={`change-line ${change.type}`}>
                  {change.type === 'addition' ? '+' : '-'} {change.content}
                </pre>
              ))}
              {file.changes.length > 5 && (
                <div className="more-changes">
                  And {file.changes.length - 5} more changes...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading">Analyzing Flutter changes...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!analysisData) {
    return <div className="empty">Select branches to analyze Flutter changes</div>;
  }

  return (
    <div className="flutter-analysis">
      <h2>Flutter Analysis Report</h2>
      {renderSummary()}
      {renderFileChanges()}
    </div>
  );
};

export default AnalysisReport;