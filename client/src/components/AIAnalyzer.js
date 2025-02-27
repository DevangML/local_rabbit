import React, { useState } from 'react';
import './AIAnalyzer.css';

/**
 * This component simulates an AI analysis by using predefined patterns and rules
 * to analyze code changes rather than using an actual AI service. It generates
 * feedback based on patterns detected in the diff data.
 */
const AIAnalyzer = ({ diffData, fromBranch, toBranch }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisPrompt, setAnalysisPrompt] = useState(
    "Analyze code changes for potential bugs, performance issues, and best practices"
  );
  
  // Predefined patterns to look for in code
  const codePatterns = {
    bugs: [
      { pattern: /setState\s*\(\s*[^,]*\s*\)\s*;.*setState\s*\(/gs, description: "Multiple setState calls in sequence might cause render issues" },
      { pattern: /\.then\s*\(\s*[^)]*\s*\)\s*(?!\.catch)/g, description: "Promise without error handling" },
      { pattern: /for\s*\(\s*let\s+i\s*=\s*0\s*;\s*i\s*<\s*.*\.length\s*;/g, description: "Array length evaluated on each iteration" },
    ],
    performance: [
      { pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*{[^}]*}\s*\)/g, description: "useEffect without dependency array" },
      { pattern: /new\s+[A-Z][a-zA-Z]*\s*\([^)]*\)/g, description: "Object creation inside render" },
      { pattern: /style={{/g, description: "Inline style object created on each render" },
    ],
    bestPractices: [
      { pattern: /console\.(log|debug|info|warn|error)/g, description: "Console statement in production code" },
      { pattern: /\/\/\s*TODO/g, description: "TODO comment left in code" },
      { pattern: /debugPrint\(/g, description: "Debug print statement in code" },
    ],
    flutterSpecific: [
      { pattern: /StatefulWidget/g, description: "Consider if StatefulWidget is necessary or if state can be lifted" },
      { pattern: /ListView\(/g, description: "Consider using ListView.builder for large lists" },
      { pattern: /Container\(\s*\)/g, description: "Empty Container widgets" },
      { pattern: /setState\s*\(\s*\(\s*\)\s*{[^}]*}\s*\)/g, description: "Complex setState logic that could be extracted" },
      { pattern: /Image\.network\(/g, description: "Network images should use caching" },
    ]
  };
  
  const severityLevels = {
    bugs: "high",
    performance: "medium",
    bestPractices: "low",
    flutterSpecific: "medium"
  };
  
  const runAnalysis = () => {
    setIsLoading(true);
    
    // Simulate analysis time
    setTimeout(() => {
      const result = analyzeCodeChanges(diffData, analysisPrompt);
      setAnalysisResults(result);
      setIsLoading(false);
    }, 1500);
  };
  
  // This function scans the diff data looking for patterns
  const analyzeCodeChanges = (diffData, prompt) => {
    if (!diffData || !diffData.files || diffData.files.length === 0) {
      return {
        summary: "No files to analyze",
        findings: []
      };
    }
    
    const findings = [];
    
    // Process each file
    diffData.files.forEach(file => {
      // Only analyze text-based files, particularly dart files
      if (!file.path.endsWith('.dart') && !file.path.endsWith('.js') && !file.path.endsWith('.jsx')) {
        return;
      }
      
      // Process each chunk in the file
      file.chunks?.forEach(chunk => {
        // Only look at added/modified lines
        const addedLines = chunk.lines.filter(line => line.type === 'addition');
        const fullContent = addedLines.map(line => line.content).join('\n');
        
        // Check for patterns in content
        Object.keys(codePatterns).forEach(category => {
          codePatterns[category].forEach(({ pattern, description }) => {
            const matches = fullContent.match(pattern);
            
            if (matches) {
              // Find line numbers for each match
              matches.forEach(() => {
                // This is a simplified approach - in a real implementation
                // we would find the exact line number for each match
                const lineNumber = chunk.newStart + addedLines.findIndex(line => 
                  pattern.test(line.content)
                );
                
                findings.push({
                  file: file.path,
                  line: lineNumber > 0 ? lineNumber : chunk.newStart,
                  category,
                  severity: severityLevels[category],
                  description,
                });
              });
            }
          });
        });
      });
    });
    
    // Generate summary based on findings
    const categoryCounts = findings.reduce((counts, finding) => {
      counts[finding.category] = (counts[finding.category] || 0) + 1;
      return counts;
    }, {});
    
    const severityCounts = findings.reduce((counts, finding) => {
      counts[finding.severity] = (counts[finding.severity] || 0) + 1;
      return counts;
    }, {});
    
    // Create recommendation summary based on prompt
    let summary = "Based on the analysis";
    if (prompt.includes("performance")) {
      summary += categoryCounts.performance > 0 
        ? ", there are performance issues that should be addressed" 
        : ", no significant performance issues were detected";
    }
    if (prompt.includes("bugs")) {
      summary += categoryCounts.bugs > 0 
        ? ", potential bugs were identified that need attention" 
        : ", no obvious bugs were detected";
    }
    if (prompt.includes("best practices")) {
      summary += categoryCounts.bestPractices > 0 
        ? ", and some code doesn't follow best practices" 
        : ", and the code generally follows best practices";
    }
    
    return {
      summary,
      findingsCount: findings.length,
      categoryCounts,
      severityCounts,
      findings: findings.sort((a, b) => {
        // Sort by severity (high to low)
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
    };
  };
  
  const renderSeverityBadge = (severity) => {
    const classes = `severity-badge severity-${severity}`;
    return <span className={classes}>{severity}</span>;
  };
  
  const renderFindingImpact = (category) => {
    const impactText = {
      bugs: "May cause application errors or crashes",
      performance: "Could impact application performance",
      bestPractices: "Affects code maintainability",
      flutterSpecific: "Flutter-specific improvement opportunity"
    };
    
    return impactText[category] || "General issue";
  };
  
  return (
    <div className="ai-analyzer">
      <div className="analyzer-header">
        <h3>AI Code Analysis</h3>
        <p className="analyzer-subtitle">
          Analyze changes using pattern detection to identify potential issues
        </p>
      </div>
      
      <div className="prompt-section">
        <label htmlFor="analysis-prompt">Analysis Prompt:</label>
        <textarea
          id="analysis-prompt"
          className="prompt-input"
          value={analysisPrompt}
          onChange={(e) => setAnalysisPrompt(e.target.value)}
          rows={2}
        />
        <button 
          className="analyze-button"
          onClick={runAnalysis}
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>
      
      {isLoading && (
        <div className="loading-animation">
          <div className="spinner"></div>
          <p>Analyzing code changes...</p>
        </div>
      )}
      
      {analysisResults && !isLoading && (
        <div className="analysis-results">
          <div className="results-summary">
            <h4>Summary</h4>
            <p>{analysisResults.summary}</p>
            
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-value">{analysisResults.findingsCount}</span>
                <span className="stat-label">Findings</span>
              </div>
              
              {Object.entries(analysisResults.severityCounts).map(([severity, count]) => (
                <div className="stat-item" key={severity}>
                  <span className="stat-value">{count}</span>
                  <span className="stat-label">
                    {renderSeverityBadge(severity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="findings-list">
            <h4>Detailed Findings</h4>
            
            {analysisResults.findings.length === 0 ? (
              <div className="no-findings">
                No issues found based on the analysis criteria.
              </div>
            ) : (
              <ul>
                {analysisResults.findings.map((finding, index) => (
                  <li key={index} className={`finding-item severity-border-${finding.severity}`}>
                    <div className="finding-header">
                      <span className="finding-file">{finding.file}</span>
                      <span className="finding-line">Line {finding.line}</span>
                      {renderSeverityBadge(finding.severity)}
                    </div>
                    <div className="finding-description">
                      {finding.description}
                    </div>
                    <div className="finding-impact">
                      <strong>Impact:</strong> {renderFindingImpact(finding.category)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalyzer;