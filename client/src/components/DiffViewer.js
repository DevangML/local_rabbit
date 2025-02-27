import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '../config';
import { cacheInstance, CACHE_TYPES } from '../utils/cache';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark as darkTheme, light as lightTheme } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { stateManager } from '../services/StateManager';
import CommentsPanel from './CommentsPanel';
import DiffSearch from './DiffSearch';
import RecoveryOptions from './RecoveryOptions';
import './DiffViewer.css';

const STORAGE_KEY = 'localCodeRabbit_viewMode';
const DIFF_STATE_KEY = 'diffViewerState';

class DiffViewerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DiffViewer Error:', error, errorInfo);
    stateManager.saveState('appState', 'lastError', {
      error: error.message,
      info: errorInfo,
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h3>Something went wrong displaying the diff</h3>
          <p>{this.state.error.toString()}</p>
          <button onClick={this.props.onReset}>Try Again</button>
          <button onClick={this.props.onRecover}>Restore Previous State</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const getFileLanguage = (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    scss: 'scss',
    dart: 'dart',
    yaml: 'yaml',
    json: 'json',
    md: 'markdown'
  };
  return languageMap[ext] || 'plaintext';
};

const getLineBackground = (file, lineNumber) => {
  if (!file.lineChanges) return 'transparent';
  const change = file.lineChanges[lineNumber];
  if (!change) return 'transparent';
  
  return {
    added: 'var(--addition)',
    deleted: 'var(--deletion)',
    modified: 'var(--warning)'
  }[change] || 'transparent';
};

const DiffViewer = ({ fromBranch, toBranch, diffData: propsDiffData }) => {
  const [diffData, setDiffData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchParams, setSearchParams] = useState({ query: '', filters: {} });
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [viewMode, setViewMode] = useState(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY);
    return savedMode || 'unified';
  });
  const [showRecovery, setShowRecovery] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load persisted state
  useEffect(() => {
    const loadState = async () => {
      try {
        const state = await stateManager.getState('diffState', DIFF_STATE_KEY);
        if (state) {
          setSearchParams(state.searchParams || { query: '', filters: {} });
          setExpandedFiles(new Set(state.expandedFiles || []));
          setViewMode(state.viewMode || 'unified');
        }
      } catch (error) {
        console.error('Error loading diff state:', error);
        setError('Failed to load saved state. Use recovery options to restore or reset.');
        setShowRecovery(true);
      }
    };
    loadState();
  }, []);

  // Save state changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await stateManager.saveState('diffState', DIFF_STATE_KEY, {
          searchParams,
          expandedFiles: Array.from(expandedFiles),
          viewMode,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error saving diff state:', error);
        setError('Failed to save state. Your changes may not persist.');
      }
    };
    saveState();
  }, [searchParams, expandedFiles, viewMode]);

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
          const response = await fetch(`${API_BASE_URL}/api/diff`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch diff');
          }

          return response.json();
        }
      );

      setDiffData(data);

      // Select the first file by default if available
      if (data.files && data.files.length > 0) {
        setSelectedFile(data.files[0]);
      } else {
        setSelectedFile(null);
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

  const handleSearch = (params) => {
    setSearchParams(params);
  };

  const highlightSearchText = useCallback((text) => {
    if (!searchParams?.query || !text) return text;
    
    const escapedQuery = searchParams.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }, [searchParams?.query]);

  const filteredFiles = useMemo(() => {
    if (!diffData || !diffData.files) return [];

    return diffData.files.filter(file => {
      const matchesQuery = !searchParams.query ||
        (file.path && file.path.toLowerCase().includes(searchParams.query.toLowerCase())) ||
        (file.content && typeof file.content === 'string' && file.content.toLowerCase().includes(searchParams.query.toLowerCase()));

      const matchesFilters = Object.entries(searchParams.filters).every(([category, selectedValues]) => {
        if (!selectedValues || selectedValues.length === 0) return true;

        switch (category) {
          case 'diffTypes':
            return file.status && selectedValues.includes(file.status);
          case 'fileTypes':
            if (!file.path) return false;
            if (file.path.endsWith('.dart')) {
              return selectedValues.includes('DART') ||
                     (file.type && selectedValues.includes(file.type.toUpperCase()));
            }
            const extension = file.path.split('.').pop().toUpperCase();
            return selectedValues.includes(extension) || 
                   (selectedValues.includes('OTHER') && !['DART', 'JAVASCRIPT', 'TYPESCRIPT', 'CSS', 'HTML', 'JSON'].includes(extension));
          case 'widgetTypes':
            if (!file.path || !file.path.endsWith('.dart')) return false;
            if (!file.content || typeof file.content !== 'string') return false;
            return selectedValues.some(type => {
              switch (type) {
                case 'STATELESS':
                  return file.content.includes('extends StatelessWidget');
                case 'STATEFUL':
                  return file.content.includes('extends StatefulWidget');
                case 'BLOC':
                  return file.content.includes('extends Bloc<') || file.content.includes('extends Cubit<');
                case 'PROVIDER':
                  return file.content.includes('extends ChangeNotifier') || file.content.includes('extends StateNotifier');
                default:
                  return false;
              }
            });
          case 'changeTypes':
            if (!file.path || !file.path.endsWith('.dart')) return false;
            if (!file.content || typeof file.content !== 'string') return false;
            return selectedValues.some(type => {
              switch (type) {
                case 'UI':
                  return file.content.includes('Widget build') || file.path.includes('widget') || file.path.includes('screen');
                case 'LOGIC':
                  return file.content.includes('void') || file.content.includes('Future<') || file.content.includes('Stream<');
                case 'STATE':
                  return file.content.includes('State<') || file.content.includes('Provider') || file.content.includes('Bloc');
                case 'DEPENDENCIES':
                  return file.path.includes('pubspec.yaml') || file.content.includes('import');
                default:
                  return false;
              }
            });
          case 'severity':
            return selectedValues.includes(file.metadata?.severity || 'Low');
          case 'status':
            return selectedValues.includes(file.metadata?.reviewStatus || 'Pending');
          case 'qualityMetrics':
            return selectedValues.some(metric => file.metadata?.qualityIssues?.includes(metric));
          default:
            return true;
        }
      });

      return matchesQuery && matchesFilters;
    });
  }, [diffData, searchParams]);

  const getFileIcon = (file) => {
    if (!file.path.endsWith('.dart')) return '📄';
    switch (file.type) {
      case 'widget': return '🔷';
      case 'screen': return '📱';
      case 'model': return '📦';
      case 'service': return '⚙️';
      case 'test': return '🧪';
      default: return '📄';
    }
  };

  const getFileTypeLabel = (file) => {
    if (!file.path.endsWith('.dart')) return 'Other';
    switch (file.type) {
      case 'widget': return 'Widget';
      case 'screen': return 'Screen';
      case 'model': return 'Model';
      case 'service': return 'Service';
      case 'test': return 'Test';
      default: return 'Other';
    }
  };

  const getFileStatusBadge = (file) => {
    const statusColors = {
      added: '#28a745',
      deleted: '#dc3545',
      modified: '#0366d6'
    };

    const statusLabels = {
      added: 'Added',
      deleted: 'Deleted',
      modified: 'Modified'
    };

    return (
      <span
        className="file-status-badge"
        style={{
          backgroundColor: statusColors[file.status] + '20',
          color: statusColors[file.status],
          border: `1px solid ${statusColors[file.status]}40`
        }}
      >
        {statusLabels[file.status]}
      </span>
    );
  };

  const renderErrors = () => {
    if (!diffData?.errors) return null;

    return (
      <div className="diff-errors">
        <h4>Analysis Errors</h4>
        <ul>
          {diffData.errors.map((error, index) => (
            <li key={index}>
              <strong>{error.file}:</strong> {error.error}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderFileMetadata = (file) => {
    if (!file.isFlutterFile || !file.metadata) return null;

    return (
      <div className="file-metadata">
        {file.metadata.error ? (
          <div className="metadata-error">
            <h4>Analysis Error</h4>
            <p>{file.metadata.error}</p>
          </div>
        ) : (
          <>
            <div className="metadata-section">
              <h4>Widget Info</h4>
              {file.metadata.widgetTypes?.length > 0 ? (
                <ul>
                  {file.metadata.widgetTypes.map((type, index) => (
                    <li key={index}>{type}</li>
                  ))}
                </ul>
              ) : (
                <p>Not a widget file</p>
              )}
            </div>

            {file.metadata.hasStateManagement && (
              <div className="metadata-section">
                <h4>State Management</h4>
                <p>Uses state management</p>
              </div>
            )}

            {file.metadata.imports?.length > 0 && (
              <div className="metadata-section">
                <h4>Imports ({file.metadata.imports.length})</h4>
                <ul className="imports-list">
                  {file.metadata.imports.map((imp, index) => (
                    <li key={index}>{imp}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

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

  const renderUnifiedView = (file) => {
    const isExpanded = expandedFiles.has(file.path);
    
    // Handle case where content is undefined
    if (!file.content) {
      return (
        <div className="diff-file" key={file.path}>
          <div className="diff-header" onClick={() => toggleFileExpansion(file.path)}>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            <span className="file-path" dangerouslySetInnerHTML={{ __html: highlightSearchText(file.path) }} />
          </div>
          <div className="diff-content no-content">
            <div className="no-content-message">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <h4>No Content Available</h4>
              <p>This could be because:</p>
              <ul>
                <li>The file was deleted in this branch</li>
                <li>The file is binary or too large to display</li>
                <li>There was an error reading the file</li>
              </ul>
              {file.status === 'deleted' && (
                <div className="no-content-status">
                  This file was deleted in the comparison
                </div>
              )}
              {file.status === 'binary' && (
                <div className="no-content-status">
                  This is a binary file and cannot be displayed
                </div>
              )}
              <button 
                className="refresh-button"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchDiffData();
                }}
              >
                Try Refreshing
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    const lines = file.content.split('\n');
    const displayLines = isExpanded ? lines : lines.slice(0, 5);

    return (
      <div className="diff-file" key={file.path}>
        <div className="diff-header" onClick={() => toggleFileExpansion(file.path)}>
          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          <span className="file-path" dangerouslySetInnerHTML={{ __html: highlightSearchText(file.path) }} />
        </div>
        <div className="diff-content">
          {displayLines.map((line, index) => (
            <div key={index} className="diff-line">
              <span className="line-number">{index + 1}</span>
              <span className="line-content" dangerouslySetInnerHTML={{ __html: highlightSearchText(line) }} />
            </div>
          ))}
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

  const renderSplitView = (file) => {
    const isExpanded = expandedFiles.has(file.path);
    
    // Handle case where content is undefined
    if (!file.content) {
      return (
        <div className="diff-file split-view" key={file.path}>
          <div className="diff-header" onClick={() => toggleFileExpansion(file.path)}>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            <span className="file-path" dangerouslySetInnerHTML={{ __html: highlightSearchText(file.path) }} />
          </div>
          <div className="diff-content no-content">
            <div className="no-content-message">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <h4>No Content Available</h4>
              <p>This could be because:</p>
              <ul>
                <li>The file was deleted in this branch</li>
                <li>The file is binary or too large to display</li>
                <li>There was an error reading the file</li>
              </ul>
              {file.status === 'deleted' && (
                <div className="no-content-status">
                  This file was deleted in the comparison
                </div>
              )}
              {file.status === 'binary' && (
                <div className="no-content-status">
                  This is a binary file and cannot be displayed
                </div>
              )}
              <button 
                className="refresh-button"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchDiffData();
                }}
              >
                Try Refreshing
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    const lines = file.content.split('\n');
    const displayLines = isExpanded ? lines : lines.slice(0, 5);

    return (
      <div className="diff-file split-view" key={file.path}>
        <div className="diff-header" onClick={() => toggleFileExpansion(file.path)}>
          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          <span className="file-path" dangerouslySetInnerHTML={{ __html: highlightSearchText(file.path) }} />
        </div>
        <div className="diff-content">
          <div className="split-pane left-pane">
            {displayLines.map((line, index) => (
              <div key={`left-${index}`} className="diff-line">
                <span className="line-number">{index + 1}</span>
                <span className="line-content" dangerouslySetInnerHTML={{ __html: highlightSearchText(line) }} />
              </div>
            ))}
          </div>
          <div className="split-pane right-pane">
            {displayLines.map((line, index) => (
              <div key={`right-${index}`} className="diff-line">
                <span className="line-number">{index + 1}</span>
                <span className="line-content" dangerouslySetInnerHTML={{ __html: highlightSearchText(line) }} />
              </div>
            ))}
          </div>
        </div>
        {!isExpanded && lines.length > 5 && (
          <button 
            className="show-more-btn"
            onClick={() => toggleFileExpansion(file.path)}
          >
            Show {lines.length - 5} more lines
          </button>
        )}
      </div>
    );
  };

  const renderFileContent = useCallback((file) => {
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
      <SyntaxHighlighter
        language={getFileLanguage(file.path)}
        style={isDarkMode ? darkTheme : lightTheme}
        showLineNumbers
        wrapLines
        lineProps={lineNumber => ({
          style: {
            backgroundColor: getLineBackground(file, lineNumber)
          }
        })}
      >
        {file.content}
      </SyntaxHighlighter>
    );
  }, [isDarkMode]);

  const handleRecovery = useCallback(async () => {
    setError(null);
    setShowRecovery(false);
    await fetchDiffData();
  }, [fetchDiffData]);

  if (error && !showRecovery) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button 
          className="recovery-button"
          onClick={() => setShowRecovery(true)}
        >
          Show Recovery Options
        </button>
      </div>
    );
  }

  if (showRecovery) {
    return (
      <div className="recovery-container">
        <RecoveryOptions onRecover={handleRecovery} />
        <button 
          className="recovery-button secondary"
          onClick={() => setShowRecovery(false)}
        >
          Back to Diff Viewer
        </button>
      </div>
    );
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

  if (!diffData) {
    return <div className="no-diff">No diff data available. Please select branches to compare.</div>;
  }

  if (!diffData.files || diffData.files.length === 0) {
    return <div className="no-diff">No changes found between selected branches</div>;
  }

  return (
    <DiffViewerErrorBoundary onReset={fetchDiffData} onRecover={handleRecovery}>
      <div className="diff-container">
        <div className="diff-header">
          <div className="file-count">
            <span className="count-badge">{filteredFiles.length}</span> file{filteredFiles.length !== 1 ? 's' : ''}
            {searchParams.query && <span className="filtering-indicator"> (filtered)</span>}
          </div>
          <div className="header-actions">
            <button
              className="refresh-button"
              onClick={fetchDiffData}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <DiffSearch 
            onSearch={handleSearch}
            initialFilters={searchParams.filters}
            initialQuery={searchParams.query}
          />
        </div>

        <div className="diff-viewer">
          <div className="file-list">
            <div className="file-list-header">
              <h3>Changed Files ({filteredFiles.length})</h3>
            </div>
            {renderErrors()}
            <ul className="file-items">
              {filteredFiles.map((file, index) => (
                <li
                  key={index}
                  className={selectedFile === file ? 'selected' : ''}
                  onClick={() => setSelectedFile(file)}
                >
                  <span className="file-icon">{getFileIcon(file)}</span>
                  <span className="file-info">
                    <span className="file-path">{file.path}</span>
                    <div className="file-meta">
                      {getFileStatusBadge(file)}
                      <span className="file-type">{getFileTypeLabel(file)}</span>
                    </div>
                    {file.metadata?.error && (
                      <span className="file-error-indicator">⚠️</span>
                    )}
                  </span>
                  <span className="file-stats">
                    <span className="additions">+{file.additions}</span>
                    <span className="deletions">-{file.deletions}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="diff-content-container">
            {selectedFile ? (
              <>
                <div className="file-header">
                  <div className="file-title">
                    <span className="file-icon">{getFileIcon(selectedFile)}</span>
                    <h3>{selectedFile.path}</h3>
                    {getFileStatusBadge(selectedFile)}
                    {selectedFile.metadata?.error && (
                      <span className="file-error-badge" title={selectedFile.metadata.error}>
                        ⚠️ Analysis Error
                      </span>
                    )}
                  </div>
                  <div className="file-actions">
                    <button
                      className="btn btn-secondary view-mode-toggle"
                      onClick={() => setViewMode(viewMode === 'unified' ? 'split' : 'unified')}
                      title={`Switch to ${viewMode === 'unified' ? 'split' : 'unified'} view`}
                    >
                      {viewMode === 'unified' ? 'Split View' : 'Unified View'}
                    </button>
                    <div className="file-stats">
                      <span className="additions">+{selectedFile.additions}</span>
                      <span className="deletions">-{selectedFile.deletions}</span>
                    </div>
                  </div>
                </div>

                {renderFileMetadata(selectedFile)}
                <div className="diff-content">
                  {viewMode === 'unified' ? renderUnifiedView(selectedFile) : renderSplitView(selectedFile)}
                </div>

                <CommentsPanel
                  fileId={`${fromBranch}-${toBranch}-${selectedFile.path}`}
                  selectedFile={selectedFile}
                />
              </>
            ) : (
              <div className="no-file-selected">
                {filteredFiles.length > 0
                  ? 'Select a file from the list to view diff'
                  : 'No changes found between selected branches'}
              </div>
            )}
          </div>
        </div>
      </div>
    </DiffViewerErrorBoundary>
  );
};

export default DiffViewer;