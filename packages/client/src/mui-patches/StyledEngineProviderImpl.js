/**
 * Patch for MUI's StyledEngineProvider
 * 
 * This file provides a minimal implementation of StyledEngineProvider
 * that's compatible with MUI's import expectations.
 */

import React from 'react';
import { ThemeContext, StyledContext } from './mui-styled-engine';

// Simple implementation of StyledEngineProvider that just renders its children
const StyledEngineProvider = ({ injectFirst, children }) => {
  // Create an empty theme object
  const theme = {};

  // Simply render the children wrapped in the context providers
  // Using React.createElement instead of JSX for compatibility
  return React.createElement(
    ThemeContext.Provider,
    { value: theme },
    React.createElement(
      StyledContext.Provider,
      { value: {} },
      children
    )
  );
};

// Export as both default and named export for flexibility
export default StyledEngineProvider;
export { StyledEngineProvider }; 