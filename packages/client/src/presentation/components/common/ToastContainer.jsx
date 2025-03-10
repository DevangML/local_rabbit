import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../contexts/ToastContext";

/**
 * Toast container component
 * Displays toast notifications
 * @param { Object } props - Component props
 * @returns { JSX.Element } - Component
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const toastVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      className="toast-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast ${toast.type}`}
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => removeToast(toast.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="toast-icon">
              {toast.type === "success" && "✅"}
              {toast.type === "error" && "❌"}
              {toast.type === "warning" && "⚠️"}
              {toast.type === "info" && "ℹ️"}
            </div>
            <div className="toast-content">
              <p>{toast.message}</p>
            </div>
            <button
              className="toast-close"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ToastContainer; 