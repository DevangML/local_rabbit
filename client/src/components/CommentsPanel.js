import React, { useState, useEffect } from 'react';
import './CommentsPanel.css';

const CommentsPanel = ({ fileId, selectedFile }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedLine, setSelectedLine] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (fileId) {
      fetchComments();
    }
  }, [fileId]);
  
  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(fileId)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddComment = async () => {
    if (!newComment || !selectedLine) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(fileId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          line: selectedLine,
          content: newComment,
          type: 'comment'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }
      
      const data = await response.json();
      setComments([...comments, data]);
      setNewComment('');
      setSelectedLine(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(fileId)}/${commentId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }
      
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <div className="comments-panel">
      <h3>Comments</h3>
      
      {error && <div className="error">{error}</div>}
      
      <div className="add-comment">
        <div className="comment-form">
          <div className="form-group">
            <label htmlFor="lineNumber">Line Number:</label>
            <input
              type="number"
              id="lineNumber"
              value={selectedLine || ''}
              onChange={(e) => setSelectedLine(e.target.value ? parseInt(e.target.value, 10) : null)}
              placeholder="Line #"
              min="1"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="commentContent">Comment:</label>
            <textarea
              id="commentContent"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your comment here..."
              rows="3"
            />
          </div>
          
          <button 
            onClick={handleAddComment} 
            disabled={isLoading || !newComment || !selectedLine}
          >
            {isLoading ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
      </div>
      
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-line">Line {comment.line}</span>
                <span className="comment-date">{formatTimestamp(comment.createdAt)}</span>
                <button 
                  className="delete-button" 
                  onClick={() => handleDeleteComment(comment.id)}
                  title="Delete comment"
                >
                  ×
                </button>
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsPanel;