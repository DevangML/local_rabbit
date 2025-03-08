import React from "react";

const LoadingIndicator = ({ message = "Loading..." }) => {
        return (
                <div className="loading-indicator" role="status" aria-live="polite">
                        <div className="loading-spinner"></div>
                        <span>{message}</span>
                </div>
        );
};

export default LoadingIndicator;
