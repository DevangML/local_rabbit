import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiff } from '../../hooks/useDiff';
import { useAppContext } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import DiffAnalyzer from './DiffAnalyzer';
import AIAnalyzer from '../ai/AIAnalyzer';

/**
 * Diff viewer component
 * @returns {JSX.Element} - Component
 */
const DiffViewer = () => {
  const [activeTab, setActiveTab] = useState('files');
  const { fromBranch, toBranch } = useAppContext();
  const { 
    data: diff, 
    isLoading, 
    error, 
    refetch 
  } = useDiff(fromBranch, toBranch);
  const { addToast } = useToast();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const tabVariants = {
    inactive: { 
      color: 'var(--color-text-secondary)',
      borderBottom: '2px solid transparent'
    },
    active: { 
      color: 'var(--color-primary)',
      borderBottom: '2px solid var(--color-primary)',
      transition: { duration: 0.3 }
    }
  };

  /**
   * Handle refresh button click
   */
  const handleRefresh = () => {
    refetch().then(() => {
      addToast('Diff refreshed successfully', 'success');
    }).catch((err) => {
      addToast(`Failed to refresh diff: ${err.message}`, 'error');
    });
  };

  if (!fromBranch || !toBranch) {
    return (
      <motion.div 
        className="diff-viewer empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p>Please select both branches to view diff</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="diff-viewer"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="diff-header"
        variants={itemVariants}
      >
        <motion.h2>
          Diff: {fromBranch} → {toBranch}
        </motion.h2>
        <motion.button 
          className="refresh-button"
          onClick={handleRefresh}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="refresh-icon">↻</span>
          Refresh
        </motion.button>
      </motion.div>
      
      {/* Loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="loading-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="loading-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            ></motion.div>
            <p>Loading diff between {fromBranch} and {toBranch}...</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error message */}
      <AnimatePresence>
        {error && !diff && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>Error: {error.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Diff content */}
      <AnimatePresence mode="wait">
        {diff && !isLoading && (
          <motion.div 
            className="diff-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tabs */}
            <motion.div 
              className="diff-tabs"
              variants={itemVariants}
            >
              <motion.div 
                className={`tab ${activeTab === 'files' ? 'active' : ''}`}
                variants={tabVariants}
                initial="inactive"
                animate={activeTab === 'files' ? 'active' : 'inactive'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('files')}
              >
                Changed Files
              </motion.div>
              <motion.div 
                className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                variants={tabVariants}
                initial="inactive"
                animate={activeTab === 'stats' ? 'active' : 'inactive'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('stats')}
              >
                Statistics
              </motion.div>
            </motion.div>
            
            {/* Tab content */}
            <AnimatePresence mode="wait">
              {activeTab === 'files' && (
                <motion.div 
                  key="files"
                  className="tab-content files-tab"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {diff.files && diff.files.length > 0 ? (
                    <motion.ul className="changed-files-list">
                      {diff.files.map((file, index) => (
                        <motion.li 
                          key={file.path}
                          className={`file-item ${file.status}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ 
                            scale: 1.02, 
                            backgroundColor: 'var(--color-hover-bg)',
                            x: 5
                          }}
                        >
                          <span className={`file-status ${file.status}`}>
                            {file.status === 'added' && '+'}
                            {file.status === 'modified' && '~'}
                            {file.status === 'deleted' && '-'}
                            {file.status === 'renamed' && '→'}
                          </span>
                          <span className="file-path">{file.path}</span>
                          <span className="file-changes">
                            {file.additions > 0 && (
                              <span className="additions">+{file.additions}</span>
                            )}
                            {file.deletions > 0 && (
                              <span className="deletions">-{file.deletions}</span>
                            )}
                          </span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  ) : (
                    <motion.div 
                      className="no-changes"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p>No file changes found between these branches</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
              
              {activeTab === 'stats' && (
                <motion.div 
                  key="stats"
                  className="tab-content stats-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="diff-stats"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="stat-label">Files Changed:</span>
                      <span className="stat-value">{diff.stats?.filesChanged || 0}</span>
                    </motion.div>
                    <motion.div 
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="stat-label">Additions:</span>
                      <span className="stat-value additions">+{diff.stats?.additions || 0}</span>
                    </motion.div>
                    <motion.div 
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="stat-label">Deletions:</span>
                      <span className="stat-value deletions">-{diff.stats?.deletions || 0}</span>
                    </motion.div>
                    <motion.div 
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="stat-label">Total Changes:</span>
                      <span className="stat-value">{(diff.stats?.additions || 0) + (diff.stats?.deletions || 0)}</span>
                    </motion.div>
                  </motion.div>
                  
                  {/* File type breakdown */}
                  {diff.stats?.fileTypes && Object.keys(diff.stats.fileTypes).length > 0 && (
                    <motion.div 
                      className="file-type-breakdown"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <h3>Changes by File Type</h3>
                      <ul className="file-types-list">
                        {Object.entries(diff.stats.fileTypes).map(([type, count], index) => (
                          <motion.li 
                            key={type}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                          >
                            <span className="file-type">{type || 'unknown'}</span>
                            <span className="file-count">{count}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Analysis section */}
      {diff && !isLoading && (
        <div className="analysis-section">
          <DiffAnalyzer fromBranch={fromBranch} toBranch={toBranch} />
          <AIAnalyzer fromBranch={fromBranch} toBranch={toBranch} />
        </div>
      )}
      
      {/* No diff selected */}
      <AnimatePresence>
        {!diff && !isLoading && !error && (
          <motion.div 
            className="no-diff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>Select branches to view diff</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiffViewer; 