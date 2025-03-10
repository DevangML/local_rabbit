/**
 * Patch for MUI's styled-engine
 * 
 * This file creates a safe version of the styled-engine that doesn't rely on
 * problematic hooks like useLayoutEffect, which can cause issues in SSR.
 */

// Import only what we need directly
import { useEffect, createContext } from 'react';
import * as React from 'react';

// Import a simplified StyledEngineProvider
import { StyledEngineProvider } from './StyledEngineProvider.jsx';

// Create safe hooks that don't cause errors
const useInsertionEffect = useEffect;
const useEnhancedEffect = useEffect;

// Create ThemeContext that's imported in useThemeWithoutDefault.js
export const ThemeContext = createContext({});

// Create StyledContext that might be used elsewhere
export const StyledContext = createContext({});

// Export the patched functions
export { useInsertionEffect, useEnhancedEffect };

// Export StyledEngineProvider as expected by MUI
export { StyledEngineProvider };

// Export a styled function with minimal features
export const styled = (Component) => {
  return (styles) => Component;
};

// Add internal_processStyles function that's imported in MUI/system
export const internal_processStyles = (styles) => styles;

// Add a no-op createCache function
export const createCache = (options = {}) => {
  return {
    insert: () => { },
    registered: {},
    insertionPoint: null,
    key: options.key || 'css',
    // Add any other properties that might be accessed
    ...options
  };
};

// Add common emotion exports that MUI might use
export const css = (...args) => "";
export const keyframes = (...args) => "";
export const jsx = (type, props) => ({ type, props });
export const Global = () => null;
export const ClassNames = () => null;

// Add the GlobalStyles component that's missing
// The GlobalStyles component should be a named export
export const GlobalStyles = ({ styles }) => null;

// Create a function that MUI's createBox can call
// MUI expects the default export to be a function
const styledFn = (Component) => {
  // Return a function that returns the component
  return function (styles) {
    return Component;
  };
};

// Add all the exports to the styled function to maintain compatibility
Object.assign(styledFn, {
  useInsertionEffect,
  useEnhancedEffect,
  ThemeContext,
  StyledContext,
  styled,
  internal_processStyles,
  createCache,
  css,
  keyframes,
  jsx,
  Global,
  ClassNames,
  GlobalStyles,
  StyledEngineProvider
});

// Export the function as default
export default styledFn; 