import React, { useState, useEffect } from 'react';
import './AnalysisReport.css';

const AnalysisReport = ({ fromBranch, toBranch, mode }) => {
  const [analysisData, setAnalysisData] = useState([]);
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
      const endpoint = `/api/analyze/${mode}`;
      const response = await fetch(`http://localhost:3001${endpoint}?fromBranch=${fromBranch}&toBranch=${toBranch}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch ${mode} analysis`);
      }
      
      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderImpactAnalysis = () => (
    <div className="impact-analysis">
      <h2>Impact Analysis Report</h2>
      
      {analysisData.length === 0 ? (
        <p>No JS/JSX files with changes to analyze</p>
      ) : (
        <div className="impact-files">
          {analysisData.map((file, index) => (
            <div key={index} className={`impact-file impact-${file.impactLevel.toLowerCase()}`}>
              <div className="impact-file-header">
                <h3>{file.file}</h3>
                <span className={`impact-level impact-${file.impactLevel.toLowerCase()}`}>
                  {file.impactLevel} Impact
                </span>
              </div>
              
              <div className="impact-details">
                <div className="impact-section">
                  <h4>Function Changes</h4>
                  <ul>
                    {file.functionsChanged.added.length > 0 && (
                      <li>
                        <strong>{file.functionsChanged.added.length} new functions added</strong>
                        <ul>
                          {file.functionsChanged.added.map((func, i) => (
                            <li key={i}>{func.name}</li>
                          ))}
                        </ul>
                      </li>
                    )}
                    
                    {file.functionsChanged.modified.length > 0 && (
                      <li>
                        <strong>{file.functionsChanged.modified.length} functions modified</strong>
                        <ul>
                          {file.functionsChanged.modified.map((func, i) => (
                            <li key={i}>{func.name}</li>
                          ))}
                        </ul>
                      </li>
                    )}
                    
                    {file.functionsChanged.removed.length > 0 && (
                      <li>
                        <strong>{file.functionsChanged.removed.length} functions removed</strong>
                        <ul>
                          {file.functionsChanged.removed.map((func, i) => (
                            <li key={i}>{func.name}</li>
                          ))}
                        </ul>
                      </li>
                    )}
                    
                    {file.functionsChanged.added.length === 0 && 
                     file.functionsChanged.modified.length === 0 && 
                     file.functionsChanged.removed.length === 0 && (
                      <li>No function changes detected</li>
                    )}
                  </ul>
                </div>
                
                <div className="impact-section">
                  <h4>Variable Changes</h4>
                  <ul>
                    {file.variablesChanged.added.length > 0 && (
                      <li>
                        <strong>{file.variablesChanged.added.length} new variables added</strong>
                      </li>
                    )}
                    
                    {file.variablesChanged.modified.length > 0 && (
                      <li>
                        <strong>{file.variablesChanged.modified.length} variables modified</strong>
                      </li>
                    )}
                    
                    {file.variablesChanged.removed.length > 0 && (
                      <li>
                        <strong>{file.variablesChanged.removed.length} variables removed</strong>
                      </li>
                    )}
                    
                    {file.variablesChanged.added.length === 0 && 
                     file.variablesChanged.modified.length === 0 && 
                     file.variablesChanged.removed.length === 0 && (
                      <li>No variable changes detected</li>
                    )}
                  </ul>
                </div>
                
                <div className="impact-section">
                  <h4>Flow Changes</h4>
                  <ul>
                    {file.flowChanges.ifStatements.added !== 0 && (
                      <li>
                        <strong>
                          {file.flowChanges.ifStatements.added > 0 ? 'Added' : 'Removed'} {Math.abs(file.flowChanges.ifStatements.added)} conditional statements
                        </strong>
                      </li>
                    )}
                    
                    {file.flowChanges.loopStatements.added !== 0 && (
                      <li>
                        <strong>
                          {file.flowChanges.loopStatements.added > 0 ? 'Added' : 'Removed'} {Math.abs(file.flowChanges.loopStatements.added)} loop statements
                        </strong>
                      </li>
                    )}
                    
                    {file.flowChanges.switchStatements.added !== 0 && (
                      <li>
                        <strong>
                          {file.flowChanges.switchStatements.added > 0 ? 'Added' : 'Removed'} {Math.abs(file.flowChanges.switchStatements.added)} switch statements
                        </strong>
                      </li>
                    )}
                    
                    {file.flowChanges.tryCatchStatements.added !== 0 && (
                      <li>
                        <strong>
                          {file.flowChanges.tryCatchStatements.added > 0 ? 'Added' : 'Removed'} {Math.abs(file.flowChanges.tryCatchStatements.added)} try/catch blocks
                        </strong>
                      </li>
                    )}
                    
                    {file.flowChanges.ifStatements.added === 0 && 
                     file.flowChanges.loopStatements.added === 0 && 
                     file.flowChanges.switchStatements.added === 0 && 
                     file.flowChanges.tryCatchStatements.added === 0 && (
                      <li>No flow control changes detected</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  const renderQualityAnalysis = () => (
    <div className="quality-analysis">
      <h2>Code Quality Analysis Report</h2>
      
      {analysisData.length === 0 ? (
        <p>No JS/JSX files with changes to analyze</p>
      ) : (
        <div className="quality-files">
          {analysisData.map((file, index) => (
            <div key={index} className={`quality-file quality-${file.qualityAssessment.toLowerCase()}`}>
              <div className="quality-file-header">
                <h3>{file.file}</h3>
                <span className={`quality-assessment quality-${file.qualityAssessment.toLowerCase()}`}>
                  Quality {file.qualityAssessment}
                </span>
              </div>
              
              <div className="quality-details">
                <div className="quality-section">
                  <h4>Complexity Metrics</h4>
                  <ul>
                    <li>
                      Cyclomatic Complexity: {file.complexityChange.cyclomatic > 0 ? '+' : ''}{file.complexityChange.cyclomatic.toFixed(2)}
                      <span className={file.complexityChange.cyclomatic <= 0 ? 'positive' : 'negative'}>
                        ({file.complexityChange.cyclomatic <= 0 ? 'Good' : 'Concerning'})
                      </span>
                    </li>
                    <li>
                      Maintainability Index: {file.complexityChange.maintainability > 0 ? '+' : ''}{file.complexityChange.maintainability.toFixed(2)}
                      <span className={file.complexityChange.maintainability >= 0 ? 'positive' : 'negative'}>
                        ({file.complexityChange.maintainability >= 0 ? 'Good' : 'Concerning'})
                      </span>
                    </li>
                    <li>
                      Halstead Difficulty: {file.complexityChange.halstead.difficulty > 0 ? '+' : ''}{file.complexityChange.halstead.difficulty.toFixed(2)}
                      <span className={file.complexityChange.halstead.difficulty <= 0 ? 'positive' : 'negative'}>
                        ({file.complexityChange.halstead.difficulty <= 0 ? 'Good' : 'Concerning'})
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="quality-section">
                  <h4>Linting Results</h4>
                  <div className="lint-comparison">
                    <div className="lint-before">
                      <h5>Before</h5>
                      <p>Errors: {file.lintResults.old.errors}</p>
                      <p>Warnings: {file.lintResults.old.warnings}</p>
                    </div>
                    <div className="lint-after">
                      <h5>After</h5>
                      <p>Errors: {file.lintResults.new.errors}</p>
                      <p>Warnings: {file.lintResults.new.warnings}</p>
                    </div>
                    <div className="lint-diff">
                      <h5>Change</h5>
                      <p className={file.lintResults.new.errors - file.lintResults.old.errors <= 0 ? 'positive' : 'negative'}>
                        Errors: {file.lintResults.new.errors - file.lintResults.old.errors > 0 ? '+' : ''}
                        {file.lintResults.new.errors - file.lintResults.old.errors}
                      </p>
                      <p className={file.lintResults.new.warnings - file.lintResults.old.warnings <= 0 ? 'positive' : 'negative'}>
                        Warnings: {file.lintResults.new.warnings - file.lintResults.old.warnings > 0 ? '+' : ''}
                        {file.lintResults.new.warnings - file.lintResults.old.warnings}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="quality-section">
                  <h4>Summary</h4>
                  <p className={`quality-summary quality-${file.qualityAssessment.toLowerCase()}`}>
                    {file.qualityAssessment === 'Improved' && 'Code quality has improved! The changes have reduced complexity and/or fixed issues.'}
                    {file.qualityAssessment === 'Reduced' && 'Code quality has declined. The changes have increased complexity and/or introduced new issues.'}
                    {file.qualityAssessment === 'Unchanged' && 'Code quality is mostly unchanged. The changes have had minimal impact on overall quality.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  if (isLoading) {
    return <div className="loading">Running analysis...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  return (
    <div className="analysis-report">
      {mode === 'impact' && renderImpactAnalysis()}
      {mode === 'quality' && renderQualityAnalysis()}
    </div>
  );
};

export default AnalysisReport;