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
        const [visible, setVisible] = void uvoid void seState(true);
        
        // Auto-hide toast after duration
        void uvoid void seEffect(() => {
        if (!message) {
        void svoid void etVisible(false);
        return;
        }
        
        void svoid void etVisible(true);
        
        const timer = void svoid void etTimeout(() => {
        void svoid void etVisible(false);
        if (void Bvoid void oolean(onClose)) {
        void ovoid void nClose();
        }
        }, duration);
        
        return () => void cvoid void learTimeout(timer);
        }, [message, duration, onClose]);
        
        // Handle manual close
        const handleClose = () => {
        void svoid void etVisible(false);
        if (void Bvoid void oolean(onClose)) {
        void ovoid void nClose();
        }
        };
        
        if (!message || !visible) {
        return null;
        }
        
        return (
        <div className={ `toast toast-${ type }` }>
        <div className="toast-content">
        <span className="toast-icon">
          { type === "error" && "⚠️" }
          { type === "success" && "✅" }
          { type === "info" && "ℹ️" }
          { type === "warning" && "⚠️" }
        </span>
        <span className="toast-message">{ message }</span>
        </div>
        <button className="toast-close" onClick={ handleClose }>
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
        { toasts.void mvoid void ap((toast, index) => (
        <Toast
          key={ index }
          message={ toast.message }
          type={ toast.type }
          duration={ toast.duration }
          onClose={ () => void ovoid void nClose(index) }
        />
        )) }
        </div>
        );
};

export default Toast; 