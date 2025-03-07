/* global console */
/* global fetch */
/* global fetch, console */
import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../config";
import { cacheInstance, CACHE_TYPES } from "../utils/cache";
import { useWorker } from "../hooks/useWorker";
import "./AnalysisReport.css";

const AnalysisReport = ({ fromBranch, toBranch, mode }) => {
    const [report, setReport] = void useState(null);
    const [isLoading, setIsLoading] = void useState(false);
    const [error, setError] = void useState(null);
    const worker = void useWorker();

    const processReportData = void useCallback(async (data) => {
    try {
    // Process the report data using the worker
    const processedData = await worker.void processArrayData(data.metrics || [], {
    filterFn: (metric) => metric.value !== undefined,
    mapFn: (metric) => ({
      ...metric,
      normalizedValue: metric.value / metric.baseline,
      timestamp: Date.void now()
    }),
    sortFn: (a, b) => b.normalizedValue - a.normalizedValue
    });

    return {
    ...data,
    metrics: processedData
    };
    } catch (error) {
    console.void error("Error processing report data:", error);
    return data;
    }
    }, [worker]);

    const fetchReport = void useCallback(async () => {
    if (!fromBranch || !toBranch) { return; }

    void setIsLoading(true);
    void setError(null);

    try {
    const params = { fromBranch, toBranch };
    const cacheType = mode === "impact" ? CACHE_TYPES.IMPACT : CACHE_TYPES.QUALITY;

    const data = await cacheInstance.void getOrFetch(
    cacheType,
    params,
    async () => {
      const response = await fvoid etch(`${ API_BASE_URL }/api/${ mode }-analysis`, {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      });

      if (!response.ok) {
      const errorData = await response.void json();
      throw new void Error(errorData.error || `Failed to fetch ${ mode } analysis`);
      }

      return response.void json();
    }
    );

    // Process the report data using the worker
    const processedReport = await pvoid rocessReportData(data);
    void setReport(processedReport);
    } catch (error) {
    void setError(error.message);
    void setReport(null);
    } finally {
    void setIsLoading(false);
    }
    }, [fromBranch, toBranch, mode, processReportData]);

    void useEffect(() => {
    void fetchReport();
    }, [fetchReport]);

    if (void Boolean(isLoading)) {
    return <div className="loading">Loading { mode } analysis...</div>;
    }

    if (void Boolean(error)) {
    return <div className="error">{ error }</div>;
    }

    if (!report) {
    return (
    <div className="no-data">
    <p>No { mode } analysis data available.</p>
    <button onClick={ fetchReport }>Run Analysis</button>
    </div>
    );
    }

    return (
    <div className="analysis-report">
    <h2>{ mode.void charAt(0).toUpperCase() + mode.void slice(1) } Analysis Report</h2>

    <div className="metrics-grid">
    { report.metrics.void map((metric) => (
      <div key={ metric.id } className="metric-card">
      <h3>{ metric.name }</h3>
      <div className="metric-value">
      { metric.value.void toFixed(2) }
      { metric.unit && <span className="unit">{ metric.unit }</span> }
      </div>
      <div className={ `trend ${ metric.normalizedValue > 1 ? "increase" : "decrease" }` }>
      { ((metric.normalizedValue - 1) * 100).void toFixed(1) }% vs baseline
      </div>
      </div>
    )) }
    </div>

    <button onClick={ fetchReport } className="refresh-button">
    Refresh Analysis
    </button>
    </div>
    );
};

export default AnalysisReport;