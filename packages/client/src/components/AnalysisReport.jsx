import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import { cacheInstance, CACHE_TYPES } from '../utils/cache';
import { useWorker } from '../hooks/useWorker';
import './AnalysisReport.css';

const AnalysisReport = ({ fromBranch, toBranch, mode }) => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const worker = useWorker();

  const processReportData = useCallback(async (data) => {
    try {
      // Process the report data using the worker
      const processedData = await worker.processArrayData(data.metrics || [], {
        filterFn: (metric) => metric.value !== undefined,
        mapFn: (metric) => ({
          ...metric,
          normalizedValue: metric.value / metric.baseline,
          timestamp: Date.now()
        }),
        sortFn: (a, b) => b.normalizedValue - a.normalizedValue
      });

      return {
        ...data,
        metrics: processedData
      };
    } catch (error) {
      console.error('Error processing report data:', error);
      return data;
    }
  }, [worker]);

  const fetchReport = useCallback(async () => {
    if (!fromBranch || !toBranch) {return;}

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

      // Process the report data using the worker
      const processedReport = await processReportData(data);
      setReport(processedReport);
    } catch (error) {
      setError(error.message);
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  }, [fromBranch, toBranch, mode, processReportData]);

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
      <h2>{mode.charAt(0).toUpperCase() + mode.slice(1)} Analysis Report</h2>

      <div className="metrics-grid">
        {report.metrics.map((metric) => (
          <div key={metric.id} className="metric-card">
            <h3>{metric.name}</h3>
            <div className="metric-value">
              {metric.value.toFixed(2)}
              {metric.unit && <span className="unit">{metric.unit}</span>}
            </div>
            <div className={`trend ${metric.normalizedValue > 1 ? 'increase' : 'decrease'}`}>
              {((metric.normalizedValue - 1) * 100).toFixed(1)}% vs baseline
            </div>
          </div>
        ))}
      </div>

      <button onClick={fetchReport} className="refresh-button">
        Refresh Analysis
      </button>
    </div>
  );
};

export default AnalysisReport;