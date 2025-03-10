/**
 * Patch for MUI's ThemeProvider
 * 
 * This provides a minimal implementation of ThemeProvider for MUI
 * that doesn't depend on the problematic parts of @mui/styled-engine.
 */

import React from 'react';
import { ThemeContext } from './mui-styled-engine';

// Simple ThemeProvider implementation
const ThemeProvider = ({ theme = {}, children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 