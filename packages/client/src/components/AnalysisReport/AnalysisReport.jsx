/* global console */
/* global fetch */
/* global console */
/* global fetch, console */
import React, { useState, useEffect, useCallback } from "react";
// Import from relative paths to avoid module resolution issues
import { apiBaseUrl as API_BASE_URL } from "../../config";

const AnalysisReport = ({
  fromBranch,
  toBranch,
  mode,
}) => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Process report data directly without using a worker
  const processReportData = useCallback(async (data) => {
    try {
      // Process the data directly
      const processedData = data.metrics
        .map((metric) => ({
          ...metric,
          normalizedValue: metric.value / metric.baseline,
          timestamp: Date.now(),
        }))
        .filter((metric) => metric.value !== undefined)
        .sort((a, b) => (b.normalizedValue || 0) - (a.normalizedValue || 0));

      return {
        ...data,
        metrics: processedData || [],
      };
    } catch (error) {
      console.error("Error processing report data:", error);
      return data;
    }
  }, []);

  const fetchReport = useCallback(async () => {
    if (!fromBranch || !toBranch) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = { fromBranch, toBranch };

      // Fetch data directly
      const response = await fetch(`${API_BASE_URL}/api/${mode}-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch ${mode} analysis`);
      }

      const data = await response.json();
      const processedReport = await processReportData(data);
      setReport(processedReport);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
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

  if (!report.metrics || report.metrics.length === 0) {
    return (
      <div className="empty-state">
        No {mode} analysis data available for the selected branches.
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
            <div
              className={`trend ${metric.normalizedValue > 1 ? "increase" : "decrease"}`}
            >
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
