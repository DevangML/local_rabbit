import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRepositories, useCurrentRepository, useSetCurrentRepository } from "../../hooks/useRepositories";
import { useToast } from "../../contexts/ToastContext";

/**
 * Repository selector component
 * @returns { JSX.Element } - Component
 */
const RepositorySelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: repositories, isLoading, error } = useRepositories();
  const { data: currentRepository } = useCurrentRepository();
  const { mutate: setCurrentRepository } = useSetCurrentRepository();
  const { addToast } = useToast();

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  /**
   * Handle repository selection
   * @param { string } path - Repository path
   */
  const handleSelectRepository = (path) => {
    setCurrentRepository(path, {
      onSuccess: () => {
        addToast(`Repository changed to ${path}`, "success");
        setIsOpen(false);
      },
      onError: (error) => {
        addToast(`Failed to change repository: ${error.message}`, "error");
      }
    });
  };

  /**
   * Toggle dropdown
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.div
      className="repository-selector"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 variants={itemVariants}>Repository</motion.h3>

      { /* Current repository display */}
      <motion.div
        className="current-repository"
        variants={itemVariants}
        onClick={toggleDropdown}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="current-value">
          {currentRepository ? currentRepository.name : "Select a repository"}
        </span>
        <motion.span
          className="dropdown-arrow"
          animate={{ rotate: isOpen ? Boolean(180) : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.div>

      { /* Repository dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="repository-dropdown"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {isLoading && (
              <motion.div
                className="loading-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="loading-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
                <span>Loading repositories...</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p>Error: {error.message}</p>
              </motion.div>
            )}

            {repositories && repositories.length > 0 && (
              <motion.ul className="repository-list">
                {repositories.map((repo) => (
                  <motion.li
                    key={repo.id}
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "var(--color-hover-bg)",
                      x: 5
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectRepository(repo.path)}
                    className={currentRepository && repo.id === currentRepository.id ? "selected" : ""}
                  >
                    {repo.name}
                    {currentRepository && repo.id === currentRepository.id && (
                      <motion.span
                        className="selected-indicator"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {repositories && repositories.length === 0 && (
              <motion.div
                className="empty-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p>No repositories found</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RepositorySelector; 