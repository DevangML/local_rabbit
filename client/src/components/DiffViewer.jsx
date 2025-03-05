import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { config } from '../config.js'; // Add explicit .js extension
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { cacheInstance, CACHE_TYPES } from '../utils/cache';
import CommentsPanel from './CommentsPanel';
import DiffSearch from './DiffSearch';
import RecoveryOptions from './RecoveryOptions';
import './DiffViewer.css';

const DiffViewer = ({ fromBranch, toBranch, diffData: propsDiffData }) => {
  const { isDark } = useSelector(state => state.theme);
  const [diffData, setDiffData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [viewMode, setViewMode] = useState('unified');
  const [searchParams, setSearchParams] = useState({ query: '', filters: {} });

  const fetchDiffData = useCallback(async () => {
    if (!fromBranch || !toBranch || propsDiffData) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = { fromBranch, toBranch };
      const data = await cacheInstance.getOrFetch(
        CACHE_TYPES.DIFF,
        params,
        async () => {
          const response = await fetch(`${config.API_BASE_URL}/api/git/diff`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch diff data');
          }

          return response.json();
        }
      );

      setDiffData(data);
      if (data.files?.length > 0) {
        setSelectedFile(data.files[0]);
      }
    } catch (error) {
      setError(error.message);
      setDiffData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fromBranch, toBranch, propsDiffData]);

  useEffect(() => {
    fetchDiffData();
  }, [fetchDiffData]);

  const toggleFileExpansion = (filePath) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const renderFileContent = (file) => {
    if (!file.content) {
      return (
        <div className="empty-content">
          <div className="empty-content-message">
            No content available
          </div>
        </div>
      );
    }

    return (
      <pre className="code-block">
        <code>{file.content}</code>
      </pre>
    );
  };

  const renderUnifiedView = (file) => {
    const isExpanded = expandedFiles.has(file.path);

    if (!file.content) {
      return (
        <div className="diff-file">
          <div className="diff-header" onClick={() => toggleFileExpansion(file.path)}>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            <span className="file-path">{file.path}</span>
          </div>
          <div className="diff-content no-content">
            <div className="no-content-message">
              <h4>No Content Available</h4>
              <p>This file might be deleted or binary</p>
            </div>
          </div>
        </div>
      );
    }

    const lines = file.content.split('\n');
    const displayLines = isExpanded ? lines : lines.slice(0, 5);

    return (
      <div className="diff-file">
        <div className="diff-header" onClick={() => toggleFileExpansion(file.path)}>
          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          <span className="file-path">{file.path}</span>
        </div>
        <div className="diff-content">
          <pre className="code-block">
            {displayLines.map((line, index) => (
              <div key={index} className="diff-line">
                <span className="line-number">{index + 1}</span>
                <code className="line-content">{line}</code>
              </div>
            ))}
          </pre>
          {!isExpanded && lines.length > 5 && (
            <button
              className="show-more-btn"
              onClick={() => toggleFileExpansion(file.path)}
            >
              Show {lines.length - 5} more lines
            </button>
          )}
        </div>
      </div>
    );
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!fromBranch || !toBranch) {
    return (
      <div className="empty-state">
        Please select both branches to view differences
      </div>
    );
  }

  if (isLoading) {
    return <div className="loading">Analyzing changes...</div>;
  }

  if (!diffData?.files?.length) {
    return <div className="no-diff">No changes found between selected branches</div>;
  }

  return (
    <div className={`diff-viewer ${isDark ? 'dark' : ''}`}>
      <div className="diff-header">
        <div className="header-actions">
          <button className="view-mode-toggle" onClick={() => setViewMode(viewMode === 'unified' ? 'split' : 'unified')}>
            {viewMode === 'unified' ? 'Split View' : 'Unified View'}
          </button>
          <button className="refresh-button" onClick={fetchDiffData}>
            Refresh
          </button>
        </div>
        <DiffSearch onSearch={setSearchParams} />
      </div>
      <div className="diff-content">
        {selectedFile ? (
          renderUnifiedView(selectedFile)
        ) : (
          <div className="no-file-selected">
            Select a file to view differences
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffViewer;
