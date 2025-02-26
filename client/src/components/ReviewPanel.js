import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import './ReviewPanel.css';
import DiffViewer from './DiffViewer';

const ReviewPanel = ({ fromBranch, toBranch }) => {
  const [reviewData, setReviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  useEffect(() => {
    if (fromBranch && toBranch) {
      fetchReview();
    }
  }, [fromBranch, toBranch]);
  
  const fetchReview = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze/review?fromBranch=${fromBranch}&toBranch=${toBranch}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch review');
      }
      
      const data = await response.json();
      setReviewData(data);
      
      if (data.length > 0) {
        setSelectedFile(data[0]);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getCommentTypeClass = (type) => {
    switch (type) {
      case 'warning': return 'comment-warning';
      case 'info': return 'comment-info';
      case 'suggestion': return 'comment-suggestion';
      default: return 'comment-default';
    }
  };
  
  if (isLoading) {
    return <div className="loading">Running review...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  return (
    <div className="review-panel">
      <div className="review-files">
        <h3>Files with Comments ({reviewData.length})</h3>
        <ul>
          {reviewData.map((file, index) => (
            <li 
              key={index} 
              className={selectedFile === file ? 'selected' : ''}
              onClick={() => setSelectedFile(file)}
            >
              <span className="file-path">{file.file}</span>
              <span className="comment-count">
                {file.comments.length} comment{file.comments.length !== 1 ? 's' : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="review-content">
        {selectedFile ? (
          <>
            <div className="file-header">
              <h3>{selectedFile.file}</h3>
            </div>
            
            <div className="review-comments">
              <h4>Review Comments</h4>
              {selectedFile.comments.length === 0 ? (
                <p>No issues found in this file</p>
              ) : (
                <ul className="comments-list">
                  {selectedFile.comments.map((comment, index) => (
                    <li 
                      key={index} 
                      className={`review-comment ${getCommentTypeClass(comment.type)}`}
                    >
                      <div className="comment-header">
                        <span className="comment-type">{comment.type}</span>
                        <span className="comment-line">Line {comment.line}</span>
                      </div>
                      <div className="comment-message">{comment.message}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="file-diff">
              <h4>File Diff</h4>
              <DiffViewer 
                fromBranch={fromBranch} 
                toBranch={toBranch} 
                selectedFilePath={selectedFile.file}
              />
            </div>
          </>
        ) : (
          <div className="no-file-selected">
            {reviewData.length > 0 
              ? 'Select a file from the list to view review comments' 
              : 'No files with review comments found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPanel;