/**
 * MUI Compatibility Patches Index
 * 
 * This file exports all our custom patches for Material UI components and utilities.
 * Import this file early in your application to ensure all patches are applied.
 */

// Re-export all of our patches for convenience
export { default as useEnhancedEffect } from './useEnhancedEffect';
export { default as StyledEngineProvider } from './StyledEngineProvider';
export { default as ThemeProvider } from './ThemeProvider.jsx';
export * from './mui-styled-engine';

// We'll avoid importing React directly to prevent potential access issues
// Instead, create a global polyfill without relying on React being defined

// Create a global fix for MUI's useEnhancedEffect calls
if (typeof window !== 'undefined') {
  // Define a global cache object for MUI
  window.__MUI_CACHE__ = {
    theme: {},
    cache: { insert: () => { }, registered: {} }
  };

  // Patch global objects that MUI might access
  try {
    // Define a ThemeContext that can be accessed globally
    if (!window.__MUI_THEME_CONTEXT__) {
      window.__MUI_THEME_CONTEXT__ = { Provider: ({ children }) => children, Consumer: ({ children }) => children() };
    }
  } catch (e) {
    console.warn('Failed to patch global MUI objects:', e);
  }

  // Attempt to patch the module system if it exists
  if (typeof window.__webpack_require__ === 'object' &&
    window.__webpack_require__ !== null &&
    typeof window.__webpack_require__.c === 'object') {

    try {
      const cache = window.__webpack_require__.c;

      // Look for MUI modules in the webpack cache
      Object.keys(cache).forEach(id => {
        if (id.includes('@mui') && id.includes('useEnhancedEffect')) {
          // Replace the exports with our safe version
          const safeImpl = { default: window.MUI_useEnhancedEffect };
          cache[id].exports = safeImpl;
        }
      });
    } catch (e) {
      console.warn('Failed to patch MUI modules:', e);
    }
  }
}

// Create a dummy insertion point for MUI styles
if (typeof document !== 'undefined' && !document.querySelector('#mui-insertion-point')) {
  try {
    const muiInsertionPoint = document.createElement('div');
    muiInsertionPoint.id = 'mui-insertion-point';
    if (document.head) {
      document.head.appendChild(muiInsertionPoint);
    }
  } catch (e) {
    console.warn('Failed to create MUI insertion point:', e);
  }
} 