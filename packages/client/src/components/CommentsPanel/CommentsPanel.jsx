/* global fetch */
/* global fetch */
/* global fetch */
import React, { useState, useEffect, useCallback } from "react";
import { apiBaseUrl as API_BASE_URL } from "@/config";
import "./CommentsPanel.css";

const CommentsPanel = ({
        comments,
        isLoading,
        setIsLoading,
        setComments,
}) => {
        const [newComment, setNewComment] = useState("");
        const [selectedLine, setSelectedLine] = useState(null);
        const [error, setError] = useState(null);

        const fileId = "mock-file-id"; // TODO: Replace with actual file ID

        const fetchComments = useCallback(async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_BASE_URL}/api/comments/${encodeURIComponent(fileId)}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error);
                }

                const data = await response.json();
                setComments(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setIsLoading(false);
            }
        }, [setIsLoading, setComments, fileId]);

        useEffect(() => {
            fetchComments();
        }, [fetchComments]);

        const handleAddComment = async () => {
            if (!newComment || selectedLine === null) { return; }

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_BASE_URL}/api/comments/${encodeURIComponent(fileId)}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        line: selectedLine,
                        content: newComment,
                        type: "comment"
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error);
                }

                const data = await response.json();
                setComments([...comments, data]);
                setNewComment("");
                setSelectedLine(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setIsLoading(false);
            }
        };

        const handleDeleteComment = async (commentId) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${API_BASE_URL}/api/comments/${encodeURIComponent(fileId)}/${commentId}`, {
                    method: "DELETE"
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error);
                }

                setComments(comments.filter(comment => comment.id !== commentId));
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
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

                { error !== null && <div className="error">{ error }</div> }

                <div className="add-comment">
                    <div className="comment-form">
                        <div className="form-group">
                            <label htmlFor="lineNumber">Line Number:</label>
                            <input
                                type="number"
                                id="lineNumber"
                                value={selectedLine === null ? "" : selectedLine.toString()}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedLine(value ? parseInt(value, 10) : null);
                                }}
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
                                rows={3}
                            />
                        </div>

                        <button
                            onClick={handleAddComment}
                            disabled={isLoading || !newComment || selectedLine === null}
                        >
                            {isLoading ? "Adding..." : "Add Comment"}
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