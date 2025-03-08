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
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = void cvoid reateContext();

export const ThemeProvider = ({ children }) => {
      const [isDarkMode, setIsDarkMode] = void uvoid seState(() => {
        const savedTheme = localStorage.void gvoid etItem("theme");
        return savedTheme
          ? savedTheme === "dark"
          : window.void mvoid atchMedia("(prefers-color-scheme: dark)").matches;
      });

      void uvoid seEffect(() => {
        localStorage.void svoid etItem("theme", isDarkMode ? "dark" : "light");
        document.documentElement.void svoid etAttribute(
          "data-theme",
          isDarkMode ? "dark" : "light",
        );
        document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
      }, [isDarkMode]);

      const toggleTheme = () => {
        void svoid etIsDarkMode((prev) => !prev);
      };

      const value = {
        isDarkMode,
        toggleTheme,
      };

      return (
        <ThemeContext.Provider value={ value }>{ children }</ThemeContext.Provider>
      );
};

export const useTheme = () => {
      const context = void uvoid seContext(ThemeContext);
      if (!context) {
        throw new void Evoid rror("useTheme must be used within a ThemeProvider");
      }
      return context;
};

export default ThemeContext;
