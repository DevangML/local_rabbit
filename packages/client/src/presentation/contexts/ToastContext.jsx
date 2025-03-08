import React, { createContext, useContext, useState, useCallback } from "react";

// Create context
const ToastContext = createContext();

/**
 * Toast provider component
 * @param { Object } props - Component props
 * @returns { JSX.Element } - Provider component
 */
export const ToastProvider = ({ children }) => {
        const [toasts, setToasts] = useState([]);

        /**
         * Add a toast notification
         * @param { string } message - Toast message
         * @param { string } type - Toast type (success, error, warning, info)
         * @param { number } duration - Duration in milliseconds
         */
        const addToast = useCallback((message, type = "info", duration = 5000) => {
                const id = Date.now().toString();

                setToasts((prevToasts) => [
                        ...prevToasts,
                        {
                                id,
                                message,
                                type,
                                duration,
                        },
                ]);

                if (duration > 0) {
                        setTimeout(() => {
                                removeToast(id);
                        }, duration);
                }
        }, [removeToast]);

        /**
         * Remove a toast notification
         * @param { string } id - Toast ID
         */
        const removeToast = useCallback((id) => {
                setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
        }, []);

        /**
         * Clear all toast notifications
         */
        const clearToasts = useCallback(() => {
                setToasts([]);
        }, []);

        // Context value
        const value = {
                toasts,
                addToast,
                removeToast,
                clearToasts,
        };

        return (
                <ToastContext.Provider value={value}>
                        {children}
                </ToastContext.Provider>
        );
};

/**
 * Custom hook to use toast context
 * @returns {Object} Toast context
 */
export const useToast = () => {
        const context = useContext(ToastContext);

        if (!context) {
                throw new Error("useToast must be used within a ToastProvider");
        }

        return context;
}; 