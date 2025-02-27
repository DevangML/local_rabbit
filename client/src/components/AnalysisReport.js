import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import './AnalysisReport.css';

const AnalysisReport = ({ fromBranch, toBranch, mode }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fromBranch && toBranch) {
      fetchAnalysis();
    }
  }, [fromBranch, toBranch, mode]);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use appropriate endpoint based on the analysis mode
      const endpoint = mode === 'impact' 
        ? `${API_BASE_URL}/api/analyze/impact` 
        : mode === 'quality' 
          ? `${API_BASE_URL}/api/analyze/quality` 
          : `${API_BASE_URL}/api/analyze/flutter`;
      
      const response = await fetch(
        `${endpoint}?fromBranch=${fromBranch}&toBranch=${toBranch}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to analyze changes for ${mode || 'flutter'} mode`);
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
            {Object.entries(summary.byType || {}).map(([type, count]) => (
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
              <span className="state-count">{summary.stateManagement?.stateful || 0}</span>
            </div>
            <div className="state-item">
              <span className="state-label">Stateless Widgets</span>
              <span className="state-count">{summary.stateManagement?.stateless || 0}</span>
            </div>
            <div className="state-item">
              <span className="state-label">BLoC Usage</span>
              <span className="state-count">{summary.stateManagement?.bloc || 0}</span>
            </div>
            <div className="state-item">
              <span className="state-label">Provider Usage</span>
              <span className="state-count">{summary.stateManagement?.provider || 0}</span>
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
                {file.analysis.widgets && file.analysis.widgets.length > 0 && (
                  <div className="analysis-item">
                    <span className="analysis-label">Widget Type:</span>
                    <span className="analysis-value">{file.analysis.widgets.join(', ')}</span>
                  </div>
                )}

                {file.analysis.stateManagement?.isStateful && (
                  <div className="analysis-item">
                    <span className="analysis-label">State Variables:</span>
                    <span className="analysis-value">{file.analysis.complexity?.stateVariables || 0}</span>
                  </div>
                )}

                {(file.analysis.stateManagement?.usesBloc || file.analysis.stateManagement?.usesProvider) && (
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

                {file.analysis.complexity?.widgetNesting > 3 && (
                  <div className="analysis-warning">
                    <span className="warning-icon">⚠️</span>
                    High widget nesting detected ({file.analysis.complexity.widgetNesting} levels)
                  </div>
                )}
              </div>
            )}

            {file.changes && (
              <div className="file-changes-preview">
                {file.changes.slice(0, 5).map((change, i) => (
                  <pre key={i} className={`change-line ${change.type}`}>
                    {change.type === 'addition' ? '+' : (change.type === 'deletion' ? '-' : ' ')} {change.content}
                  </pre>
                ))}
                {file.changes.length > 5 && (
                  <div className="more-changes">
                    And {file.changes.length - 5} more changes...
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderQualityAnalysis = () => {
    if (!analysisData.files || !Array.isArray(analysisData.files)) {
      return <div className="empty">No quality analysis data available</div>;
    }
    
    return (
      <div className="quality-analysis">
        <div className="quality-summary">
          <h3>Quality Assessment</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Overall Score</span>
              <span className="summary-value">{analysisData.summary.overallScore?.toFixed(1) || 'N/A'}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Files Analyzed</span>
              <span className="summary-value">{analysisData.files.length}</span>
            </div>
          </div>
        </div>
        
        <div className="quality-recommendations">
          <h3>Recommendations</h3>
          {analysisData.recommendations && analysisData.recommendations.length > 0 ? (
            <ul className="recommendations-list">
              {analysisData.recommendations.map((rec, index) => (
                <li key={index} className={`recommendation-item priority-${rec.priority}`}>
                  <div className="recommendation-header">
                    <span className="recommendation-priority">{rec.priority}</span>
                    <span className="recommendation-message">{rec.message}</span>
                  </div>
                  <div className="recommendation-details">{rec.details}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recommendations available.</p>
          )}
        </div>
        
        <div className="quality-files">
          <h3>File Analysis</h3>
          {analysisData.files.map((file, index) => (
            <div key={index} className="quality-file-card">
              <div className="file-header">
                <div className="file-info">
                  <span className="file-type">{file.type}</span>
                  <span className="file-path">{file.path}</span>
                </div>
                <div className="quality-assessment">{file.assessment}</div>
              </div>
              
              <div className="quality-metrics">
                {file.details && file.details.map((detail, i) => (
                  <div key={i} className="metric-item">
                    <span className="metric-label">{detail.name}:</span>
                    <span className={`metric-value ${detail.value > detail.threshold ? 'warning' : ''}`}>
                      {detail.value} {detail.value > detail.threshold && '⚠️'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderImpactAnalysis = () => {
    if (!analysisData.files || !Array.isArray(analysisData.files)) {
      return <div className="empty">No impact analysis data available</div>;
    }
    
    return (
      <div className="impact-analysis">
        <div className="impact-summary">
          <h3>Impact Assessment</h3>
          <div className="risk-grid">
            {analysisData.risks && analysisData.risks.map((risk, index) => (
              <div key={index} className={`risk-item risk-${risk.level}`}>
                <div className="risk-header">
                  <span className="risk-level">{risk.level.toUpperCase()}</span>
                  <span className="risk-file">{risk.file}</span>
                </div>
                <div className="risk-message">{risk.message}</div>
              </div>
            ))}
            {(!analysisData.risks || analysisData.risks.length === 0) && (
              <p>No significant risks detected.</p>
            )}
          </div>
        </div>
        
        <div className="impact-files">
          <h3>Files by Impact</h3>
          {analysisData.files.map((file, index) => (
            <div key={index} className="impact-file-card">
              <div className="file-header">
                <div className="file-info">
                  <span className="file-type">{file.type}</span>
                  <span className="file-path">{file.path}</span>
                </div>
                <div className={`impact-level impact-${file.impactLevel}`}>
                  {file.impactLevel?.toUpperCase() || 'UNKNOWN'}
                </div>
              </div>
              
              <div className="impact-details">
                <div className="changes-summary">
                  <span className="additions">+{file.changes?.additions || file.additions || 0}</span>
                  <span className="deletions">-{file.changes?.deletions || file.deletions || 0}</span>
                </div>
                
                {file.analysis?.stateManagement?.isStateful && (
                  <div className="state-badge">Stateful</div>
                )}
                {file.analysis?.stateManagement?.usesBloc && (
                  <div className="state-badge bloc">Uses BLoC</div>
                )}
                {file.analysis?.stateManagement?.usesProvider && (
                  <div className="state-badge provider">Uses Provider</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAnalysisContent = () => {
    if (mode === 'impact') {
      return renderImpactAnalysis();
    } else if (mode === 'quality') {
      return renderQualityAnalysis();
    } else {
      // Default Flutter analysis
      return (
        <>
          {renderSummary()}
          {renderFileChanges()}
        </>
      );
    }
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
      <h2>{mode === 'impact' ? 'Impact Analysis' : mode === 'quality' ? 'Quality Analysis' : 'Flutter Analysis'}</h2>
      {renderAnalysisContent()}
    </div>
  );
};

export default AnalysisReport;