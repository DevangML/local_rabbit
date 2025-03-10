import React from 'react';

// Simple implementation of StyledEngineProvider that just renders its children
const StyledEngineProvider = ({ injectFirst, children }) => {
  // Simply render the children without any context providers
  return children;
};

// Export as both default and named export for flexibility
export default StyledEngineProvider;
export { StyledEngineProvider }; 