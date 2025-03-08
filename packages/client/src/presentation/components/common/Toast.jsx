import React, { useState, useEffect } from "react";

/**
 * Toast notification component
 * @param { Object } props - Component props
 * @returns { JSX.Element } - Component
 */
const Toast = ({
        message,
        type = "info",
        duration = 5000,
        onClose
}) => {
        const [visible, setVisible] = useState(true);

        // Auto-hide toast after duration
        useEffect(() => {
                if (!message) {
                        setVisible(false);
                        return;
                }

                setVisible(true);

                const timer = setTimeout(() => {
                        setVisible(false);
                        if (Boolean(onClose)) {
                                onClose();
                        }
                }, duration);

                return () => clearTimeout(timer);
        }, [message, duration, onClose]);

        // Handle manual close
        const handleClose = () => {
                setVisible(false);
                if (Boolean(onClose)) {
                        onClose();
                }
        };

        if (!message || !visible) {
                return null;
        }

        return (
                <div className={`toast toast-${type}`}>
                        <div className="toast-content">
                                <span className="toast-icon">
                                        {type === "error" && "⚠️"}
                                        {type === "success" && "✅"}
                                        {type === "info" && "ℹ️"}
                                        {type === "warning" && "⚠️"}
                                </span>
                                <span className="toast-message">{message}</span>
                        </div>
                        <button className="toast-close" onClick={handleClose}>
                                ×
                        </button>
                </div>
        );
};

/**
 * Toast container component
 * @param { Object } props - Component props
 * @returns { JSX.Element } - Component
 */
export const ToastContainer = ({ toasts = [], onClose }) => {
        if (!toasts.length) {
                return null;
        }

        return (
                <div className="toast-container">
                        {toasts.map((toast, index) => (
                                <Toast
                                        key={index}
                                        message={toast.message}
                                        type={toast.type}
                                        duration={toast.duration}
                                        onClose={() => onClose(index)}
                                />
                        ))}
                </div>
        );
};

export default Toast; 