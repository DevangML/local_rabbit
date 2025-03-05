import React, { createContext, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { themes } from '../themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { currentTheme, isDark } = useSelector(state => state.theme);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Apply theme colors
    if (currentTheme?.colors) {
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
    }

    // Apply color scheme
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [currentTheme, isDark]);

  const value = {
    currentTheme: currentTheme || themes['lunar-light'],
    isDark,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
