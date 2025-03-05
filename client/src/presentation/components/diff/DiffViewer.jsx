import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';

/**
 * Diff viewer component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Component
 */
const DiffViewer = ({ fromBranch, toBranch }) => {
  const { getDiff, loading, error } = useAppContext();
  const [diff, setDiff] = useState(null);
  const [activeTab, setActiveTab] = useState('files');

  // Fetch diff when branches change
  useEffect(() => {
    if (fromBranch && toBranch) {
      fetchDiff();
    } else {
      setDiff(null);
    }
  }, [fromBranch, toBranch]);

  /**
   * Fetch diff between branches
   */
  const fetchDiff = async () => {
    try {
      const diffData = await getDiff(fromBranch, toBranch);
      setDiff(diffData);
    } catch (err) {
      console.error('Error in DiffViewer:', err);
    }
  };

  if (!fromBranch || !toBranch) {
    return (
      <div className="diff-viewer empty">
        <p>Please select both branches to view diff</p>
      </div>
    );
  }

  if (loading && !diff) {
    return <div className="diff-viewer loading">Loading diff...</div>;
  }

  if (error && !diff) {
    return (
      <div className="diff-viewer error">
        <p>Error: {error}</p>
        <button onClick={fetchDiff}>Retry</button>
      </div>
    );
  }

  if (!diff) {
    return (
      <div className="diff-viewer empty">
        <p>No diff available</p>
        <button onClick={fetchDiff}>Refresh</button>
      </div>
    );
  }

  return (
    <div className="diff-viewer">
      <h2>Diff: {fromBranch} → {toBranch}</h2>
      
      {/* Tabs */}
      <div className="diff-tabs">
        <button 
          className={activeTab === 'files' ? 'active' : ''} 
          onClick={() => setActiveTab('files')}
        >
          Changed Files
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''} 
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </div>
      
      {/* Tab content */}
      <div className="diff-content">
        {activeTab === 'files' && (
          <div className="diff-files">
            <h3>Changed Files</h3>
            {diff.files && diff.files.length > 0 ? (
              <ul className="file-list">
                {diff.files.map((file, index) => (
                  <li key={index} className={`file-item ${file.status.toLowerCase()}`}>
                    <span className="file-status">{file.status}</span>
                    <span className="file-path">{file.path}</span>
                    {file.additions > 0 && (
                      <span className="file-additions">+{file.additions}</span>
                    )}
                    {file.deletions > 0 && (
                      <span className="file-deletions">-{file.deletions}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No files changed</p>
            )}
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div className="diff-stats">
            <h3>Diff Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Files Changed</span>
                <span className="stat-value">{diff.stats?.filesChanged || 0}</span>
              </div>
              <div className="stat-item additions">
                <span className="stat-label">Additions</span>
                <span className="stat-value">+{diff.stats?.additions || 0}</span>
              </div>
              <div className="stat-item deletions">
                <span className="stat-label">Deletions</span>
                <span className="stat-value">-{diff.stats?.deletions || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Refresh button */}
      <div className="diff-actions">
        <button onClick={fetchDiff} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Diff'}
        </button>
      </div>
    </div>
  );
};

export default DiffViewer; 