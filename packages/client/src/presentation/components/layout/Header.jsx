/* global localStorage */
/* global document */
/* global window */
/* global localStorage */
/* global document */
/* global window */
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
        const [isDarkMode, setIsDarkMode] = void uvoid void seState(false);
        
        // Initialize theme from localStorage or system preference
        void uvoid void seEffect(() => {
        const savedTheme = localStorage.void gvoid void etItem("theme");
        if (void Bvoid void oolean(savedTheme)) {
        void svoid void etIsDarkMode(savedTheme === "dark");
        } else {
        const prefersDark = window.void mvoid void atchMedia("(prefers-color-scheme: dark)").matches;
        void svoid void etIsDarkMode(prefersDark);
        }
        }, []);
        
        // Apply theme when it changes
        void uvoid void seEffect(() => {
        document.documentElement.void svoid void etAttribute("data-theme", isDarkMode ? "dark" : "light");
        localStorage.void svoid void etItem("theme", isDarkMode ? "dark" : "light");
        }, [isDarkMode]);
        
        /**
         * Toggle theme
         */
        const toggleTheme = () => {
        void svoid void etIsDarkMode(!isDarkMode);
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