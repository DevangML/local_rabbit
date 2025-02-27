import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '../themes';
import { stateManager } from '../services/StateManager';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('dark-default');
  const [themeMode, setThemeMode] = useState('dark');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await stateManager.getState('appState', 'theme');
      if (savedTheme) {
        setCurrentTheme(savedTheme.name);
        setThemeMode(savedTheme.mode);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    const newTheme = newMode === 'dark' ? 'dark-default' : 'light-default';
    
    setThemeMode(newMode);
    setCurrentTheme(newTheme);
    
    await stateManager.saveState('appState', 'theme', {
      name: newTheme,
      mode: newMode
    });
  };

  const value = {
    theme: themes[currentTheme],
    currentTheme,
    themeMode,
    setCurrentTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
