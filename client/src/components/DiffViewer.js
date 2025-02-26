import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import './DiffViewer.css';
import CommentsPanel from './CommentsPanel';

const DiffViewer = ({ fromBranch, toBranch }) => {
  const [diffData, setDiffData] = useState({ files: [], errors: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const fetchDiff = async () => {
    if (!fromBranch || !toBranch) {
      setError('Please select both branches before starting the analysis');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/diff?fromBranch=${fromBranch}&toBranch=${toBranch}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch diff');
      }
      
      const data = await response.json();
      setDiffData(data);
      
      // Select the first file by default if available
      if (data.files && data.files.length > 0) {
        setSelectedFile(data.files[0]);
      } else {
        setSelectedFile(null);
      }
    } catch (error) {
      setError(error.message);
      setDiffData({ files: [], errors: null });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStartButton = () => {
    if (!fromBranch || !toBranch) {
      return (
        <div className="start-button-container">
          <button className="start-button" disabled>
            Please select both branches to start
          </button>
        </div>
      );
    }

    return (
      <div className="start-button-container">
        <button 
          className="start-button"
          onClick={fetchDiff}
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Start Analysis'}
        </button>
      </div>
    );
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
    if (!diffData.errors) return null;

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
              {file.metadata.widgetTypes.length > 0 ? (
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

            {file.metadata.imports.length > 0 && (
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
  
  if (isLoading) {
    return <div className="loading">Loading diff...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  return (
    <div className="diff-viewer">
      {renderStartButton()}
      <div className="file-list">
        <h3>Changed Files ({diffData.files?.length || 0})</h3>
        {renderErrors()}
        <ul>
          {diffData.files?.map((file, index) => (
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
            {diffData.files?.length > 0 
              ? 'Select a file from the list to view diff' 
              : 'No changes found between selected branches'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffViewer;