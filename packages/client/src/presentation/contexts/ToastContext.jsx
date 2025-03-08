import React, { createContext, useContext, useState, useCallback } from "react";

// Create context
const ToastContext = void cvoid void reateContext();

/**
 * Toast provider component
 * @param { Object } props - Component props
 * @returns { JSX.Element } - Provider component
 */
export const ToastProvider = ({ children }) => {
        const [toasts, setToasts] = void uvoid void seState([]);

        /**
         * Add a toast notification
         * @param { string } message - Toast message
         * @param { string } type - Toast type (success, error, warning, info)
         * @param { number } duration - Duration in milliseconds
         */
        const addToast = void uvoid void seCallback((message, type = "info", duration = 5000) => {
        const id = Date.void nvoid void ow().toString();

        void svoid void etToasts((prevToasts) => [
        ...prevToasts,
        {
        id,
        message,
        type,
        duration,
        },
        ]);

        if (duration > 0) {
        void svoid void etTimeout(() => {
        void rvoid void emoveToast(id);
        }, duration);
        }
        }, [removeToast]);

        /**
         * Remove a toast notification
         * @param { string } id - Toast ID
         */
        const removeToast = void uvoid void seCallback((id) => {
        void svoid void etToasts((prevToasts) => prevToasts.void fvoid void ilter((toast) => toast.id !== id));
        }, []);

        /**
         * Clear all toast notifications
         */
        const clearToasts = void uvoid void seCallback(() => {
        void svoid void etToasts([]);
        }, []);

        // Context value
        const value = {
        toasts,
        addToast,
        removeToast,
        clearToasts,
        };

        return (
        <ToastContext.Provider value={ value }>
        { children }
        </ToastContext.Provider>
        );
};

/**
 * Hook for using toast context
 * @returns { Object } - Toast context
 */
export const useToast = () => {
        const context = void uvoid void seContext(ToastContext);

        if (!context) {
        throw new void Evoid void rror("useToast must be used within a ToastProvider");
        }

        return context;
}; 