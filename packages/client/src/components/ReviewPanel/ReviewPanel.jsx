/* global console */
/* global fetch */
/* global console */
/* global fetch */
/* global console */
/* global fetch */
/* global fetch, console */
import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../config";
import "./ReviewPanel.css";
import DiffViewer from "./DiffViewer";

const ReviewPanel = ({ fromBranch, toBranch }) => {
  const [reviewData, setReviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchReview = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fromBranch, toBranch }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch review");
      }

      const data = await response.json();
      setReviewData(Array.isArray(data) ? data : []);

      if (data.length > 0) {
        setSelectedFile(data[0]);
      } else {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [fromBranch, toBranch]);

  useEffect(() => {
    if (fromBranch && Boolean(toBranch)) {
      fetchReview();
    }
  }, [fromBranch, toBranch, fetchReview]);

  const getCommentTypeClass = (type) => {
    switch (type) {
      case "error": return "error-comment";
      case "warning": return "warning-comment";
      case "info": return "info-comment";
      default: return "";
    }
  };

  if (isLoading) {
    return <div className="loading">Running review...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (reviewData.length === 0) {
    return <div className="empty-review">No review comments found for the selected branches.</div>;
  }

  return (
    <div className="review-panel">
      <div className="review-files">
        <h3>Files with Comments ({reviewData.length})</h3>
        <ul>
          {reviewData.map((file, index) => (
            <li
              key={index}
              className={selectedFile === file ? "selected" : ""}
              onClick={() => setSelectedFile(file)}
            >
              <span className="file-path">{file.file}</span>
              <span className="comment-count">
                {file.comments.length} comment{file.comments.length !== 1 ? "s" : ""}
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
              ? "Select a file from the list to view review comments"
              : "No files with review comments found"}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPanel;