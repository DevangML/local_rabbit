import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import { cacheInstance, CACHE_TYPES } from '../utils/cache';
import './DiffViewer.css';
import CommentsPanel from './CommentsPanel';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';

const DiffViewer = ({ fromBranch, toBranch, diffData: propsDiffData }) => {
  const [diffData, setDiffData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [localFilters, setLocalFilters] = useState({});
  
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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters) => {
    setLocalFilters(filters);
  };

  const filterOptions = [
    {
      id: 'fileType',
      label: 'File Type',
      type: 'select',
      options: [
        { value: 'widget', label: 'Widget' },
        { value: 'screen', label: 'Screen' },
        { value: 'model', label: 'Model' },
        { value: 'service', label: 'Service' },
        { value: 'test', label: 'Test' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'fileStatus',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'added', label: 'Added' },
        { value: 'modified', label: 'Modified' },
        { value: 'deleted', label: 'Deleted' }
      ]
    },
    {
      id: 'changes',
      label: 'Changes',
      type: 'checkbox-group',
      options: [
        { value: 'hasAdditions', label: 'Has Additions' },
        { value: 'hasDeletions', label: 'Has Deletions' }
      ]
    }
  ];

  const getFilteredFiles = () => {
    if (!diffData || !diffData.files) return [];

    return diffData.files.filter(file => {
      // Search filter
      if (searchQuery && !file.path.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (localFilters.fileType && file.type !== localFilters.fileType) {
        return false;
      }

      // Status filter
      if (localFilters.fileStatus && file.status !== localFilters.fileStatus) {
        return false;
      }

      // Changes filter
      if (localFilters.changes) {
        if (localFilters.changes.includes('hasAdditions') && file.additions === 0) {
          return false;
        }
        if (localFilters.changes.includes('hasDeletions') && file.deletions === 0) {
          return false;
        }
      }

      return true;
    });
  };

  const getLineClass = (line) => {
    switch (line.type) {
      case 'addition': return 'line-addition';
      case 'deletion': return 'line-deletion';
      default: return 'line-context';
    }
  };
  
  const getLinePrefix = (line) => {
    switch (line.type) {
      case 'addition': return '+';
      case 'deletion': return '-';
      default: return ' ';
    }
  };

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

  const filteredFiles = getFilteredFiles();
  
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

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!diffData || !diffData.files || diffData.files.length === 0) {
    return <div className="no-diff">No changes found between selected branches</div>;
  }
  
  return (
    <div className="diff-container">
      <div className="diff-header">
        <div className="file-count">
          <span className="count-badge">{filteredFiles.length}</span> file{filteredFiles.length !== 1 ? 's' : ''} 
          {searchQuery && <span className="filtering-indicator"> (filtered)</span>}
        </div>
        <div className="header-actions">
          <button 
            className="refresh-button"
            onClick={fetchDiffData}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="search-filter-bar">
        <SearchBar onSearch={handleSearch} placeholder="Search files..." />
        <FilterPanel filters={filterOptions} onFilterChange={handleFilterChange} />
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
        
        <div className="diff-content">
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
                <div className="file-stats">
                  <span className="additions">+{selectedFile.additions}</span>
                  <span className="deletions">-{selectedFile.deletions}</span>
                </div>
              </div>
              
              {renderFileMetadata(selectedFile)}
              
              <div className="diff-code">
                {selectedFile.chunks?.map((chunk, chunkIndex) => (
                  <div key={chunkIndex} className="diff-chunk">
                    <div className="chunk-header">
                      @@ -{chunk.oldStart},{chunk.oldLines} +{chunk.newStart},{chunk.newLines} @@
                    </div>
                    
                    <table className="diff-table">
                      <tbody>
                        {chunk.lines.map((line, lineIndex) => {
                          const lineNumber = line.type === 'deletion' 
                            ? chunk.oldStart + lineIndex 
                            : chunk.newStart + lineIndex;
                            
                          return (
                            <tr key={lineIndex} className={getLineClass(line)}>
                              <td className="line-number">{lineNumber}</td>
                              <td className="line-content">
                                <span className="line-prefix">{getLinePrefix(line)}</span>
                                <span className="line-text">{line.content}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
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
  );
};

export default DiffViewer;