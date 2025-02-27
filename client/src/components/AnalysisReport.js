import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import { cacheInstance, CACHE_TYPES } from '../utils/cache';
import './AnalysisReport.css';

const AnalysisReport = ({ fromBranch, toBranch, mode }) => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    if (!fromBranch || !toBranch) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = { fromBranch, toBranch };
      const cacheType = mode === 'impact' ? CACHE_TYPES.IMPACT : CACHE_TYPES.QUALITY;
      
      const data = await cacheInstance.getOrFetch(
        cacheType,
        params,
        async () => {
          const response = await fetch(`${API_BASE_URL}/api/${mode}-analysis`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch ${mode} analysis`);
          }

          return response.json();
        }
      );

      setReport(data);
    } catch (error) {
      setError(error.message);
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  }, [fromBranch, toBranch, mode]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (isLoading) {
    return <div className="loading">Loading {mode} analysis...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!report) {
    return (
      <div className="no-data">
        <p>No {mode} analysis data available.</p>
        <button onClick={fetchReport}>Run Analysis</button>
      </div>
    );
  }

  return (
    <div className="analysis-report">
      <h2>{mode === 'impact' ? 'Impact Analysis' : 'Quality Check'} Report</h2>
      <div className="report-content">
        {mode === 'impact' ? (
          <>
            <section className="impact-metrics">
              <h3>Impact Metrics</h3>
              <ul>
                <li>Files Changed: {report.filesChanged}</li>
                <li>Lines Added: {report.linesAdded}</li>
                <li>Lines Removed: {report.linesRemoved}</li>
                <li>Impact Score: {report.impactScore}</li>
              </ul>
            </section>
            {report.dependencies && (
              <section className="dependencies">
                <h3>Affected Dependencies</h3>
                <ul>
                  {report.dependencies.map((dep, index) => (
                    <li key={index}>{dep}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <>
            <section className="quality-metrics">
              <h3>Quality Metrics</h3>
              <ul>
                <li>Code Coverage: {report.coverage}%</li>
                <li>Maintainability Index: {report.maintainability}</li>
                <li>Technical Debt Score: {report.technicalDebt}</li>
              </ul>
            </section>
            {report.issues && (
              <section className="issues">
                <h3>Quality Issues</h3>
                <ul>
                  {report.issues.map((issue, index) => (
                    <li key={index} className={`severity-${issue.severity}`}>
                      <span className="issue-severity">{issue.severity}</span>
                      <span className="issue-message">{issue.message}</span>
                      <span className="issue-location">{issue.location}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
      <button onClick={fetchReport} className="refresh-button">
        Refresh Analysis
      </button>
    </div>
  );
};

export default AnalysisReport;