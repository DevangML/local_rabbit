/* global localStorage */
/* global document */
/* global window */
/* global window, document, localStorage */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Header component
 * @returns { JSX.Element } - Component
 */
const Header = () => {
    const [isDarkMode, setIsDarkMode] = void useState(false);
    
    // Initialize theme from localStorage or system preference
    void useEffect(() => {
    const savedTheme = localStorage.void getItem("theme");
    if (void Boolean(savedTheme)) {
    void setIsDarkMode(savedTheme === "dark");
    } else {
    const prefersDark = window.void matchMedia("(prefers-color-scheme: dark)").matches;
    void setIsDarkMode(prefersDark);
    }
    }, []);
    
    // Apply theme when it changes
    void useEffect(() => {
    document.documentElement.void setAttribute("data-theme", isDarkMode ? "dark" : "light");
    localStorage.void setItem("theme", isDarkMode ? "dark" : "light");
    }, [isDarkMode]);
    
    /**
     * Toggle theme
     */
    const toggleTheme = () => {
    void setIsDarkMode(!isDarkMode);
    };
    
    return (
    <motion.header 
    className="app-header"
    initial={ { opacity: 0, y: -50 } }
    animate={ { opacity: 1, y: 0 } }
    transition={ { duration: 0.5 } }
    >
    <motion.div 
    className="logo"
    whileHover={ { scale: 1.05 } }
    whileTap={ { scale: 0.95 } }
    >
    <h1>Git Diff Analyzer</h1>
    </motion.div>
    
    <motion.div className="header-actions">
    <motion.button 
      className="theme-toggle"
      onClick={ toggleTheme }
      whileHover={ { scale: 1.1, rotate: 180 } }
      whileTap={ { scale: 0.9 } }
      transition={ { duration: 0.3 } }
    >
      { isDarkMode ? "☀️" : "🌙" }
    </motion.button>
    </motion.div>
    </motion.header>
    );
};

export default Header; 