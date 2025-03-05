import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/common/Toast';

// Create context
const ToastContext = createContext(null);

/**
 * Custom hook to use the toast context
 * @returns {Object} - Toast context
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

/**
 * Toast provider component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Provider component
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  /**
   * Add a toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (info, success, error, warning)
   * @param {number} duration - Duration in milliseconds
   */
  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    setToasts((prevToasts) => [...prevToasts, { message, type, duration }]);
  }, []);
  
  /**
   * Remove a toast notification
   * @param {number} index - Toast index
   */
  const removeToast = useCallback((index) => {
    setToasts((prevToasts) => prevToasts.filter((_, i) => i !== index));
  }, []);
  
  /**
   * Clear all toast notifications
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);
  
  // Context value
  const value = {
    addToast,
    removeToast,
    clearToasts
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastContext; 