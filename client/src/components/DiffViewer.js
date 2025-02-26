import React, { useState, useEffect } from 'react';
import './DiffViewer.css';
import CommentsPanel from './CommentsPanel';

const DiffViewer = ({ fromBranch, toBranch }) => {
  const [diffData, setDiffData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  useEffect(() => {
    if (fromBranch && toBranch) {
      fetchDiff();
    }
  }, [fromBranch, toBranch]);
  
  const fetchDiff = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/diff?fromBranch=${fromBranch}&toBranch=${toBranch}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch diff');
      }
      
      const data = await response.json();
      setDiffData(data);
      
      // Select the first file by default if available
      if (data.length > 0) {
        setSelectedFile(data[0]);
      } else {
        setSelectedFile(null);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
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
  
  if (isLoading) {
    return <div className="loading">Loading diff...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  return (
    <div className="diff-viewer">
      <div className="file-list">
        <h3>Changed Files ({diffData.length})</h3>
        <ul>
          {diffData.map((file, index) => (
            <li 
              key={index} 
              className={selectedFile === file ? 'selected' : ''}
              onClick={() => setSelectedFile(file)}
            >
              <span className="file-path">{file.newPath}</span>
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
              <h3>{selectedFile.newPath}</h3>
              <div className="file-stats">
                <span className="additions">+{selectedFile.additions}</span>
                <span className="deletions">-{selectedFile.deletions}</span>
              </div>
            </div>
            
            <div className="diff-code">
              {selectedFile.chunks.map((chunk, chunkIndex) => (
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
              fileId={`${fromBranch}-${toBranch}-${selectedFile.newPath}`} 
              selectedFile={selectedFile}
            />
          </>
        ) : (
          <div className="no-file-selected">
            {diffData.length > 0 
              ? 'Select a file from the list to view diff' 
              : 'No changes found between selected branches'}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffViewer;