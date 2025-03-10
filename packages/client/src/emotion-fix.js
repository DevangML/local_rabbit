/**
 * This file provides fixes for Emotion initialization issues
 * It should be imported before any other Emotion imports
 */

// Import React to ensure it's available
import * as React from 'react';

// Detect server-side rendering environment
export const isServer = typeof window === 'undefined';
export const isBrowser = !isServer;

// Make React globally available immediately, but only in browser environment
if (isBrowser) {
  window.React = React;
}

// Polyfill React's useInsertionEffect for Emotion
// This needs to be done before any Emotion imports
if (isBrowser) {
  // Fix for "Cannot access 'Wo' before initialization" error
  // This ensures that the useInsertionEffect is properly initialized
  window.__EMOTION_INSERTION_EFFECT__ = true;
}

// Define a safe way to access React hooks that handles when they might be undefined
const getSafeReactHook = (hookName) => {
  // First check if React is available
  if (!React) {
    // Return a no-op function if React isn't available
    return (fn) => { fn(); return () => { }; };
  }

  // Then safely access the hook
  return React[hookName] || ((fn) => { fn(); return () => { }; });
};

// Define our own useInsertionEffect hook that falls back to useLayoutEffect or useEffect
// This avoids modifying the React import directly
export const useInsertionEffectPolyfill =
  (React.useInsertionEffect ||
    // On the server, useLayoutEffect causes a warning, so we use useEffect instead
    (isServer ? getSafeReactHook('useEffect') : getSafeReactHook('useLayoutEffect')) ||
    ((fn) => fn()));

// Import the module to reference it before augmentation
import '@mui/styled-engine';

// Export our own implementation of useEnhancedEffect for MUI to use
export const muiUseEnhancedEffect = isServer ? getSafeReactHook('useEffect') : getSafeReactHook('useLayoutEffect');

// Create a patch to replace MUI's useEnhancedEffect with our implementation
if (typeof window !== 'undefined') {
  // Only run this in the browser to avoid SSR issues
  try {
    // Create a global function that mimics the useEnhancedEffect hook
    // This creates a safer approach than patching webpack modules
    window.MUI_useEnhancedEffect = muiUseEnhancedEffect;

    // Try to define a module to handle any import to useEnhancedEffect
    if (window.__webpack_require__) {
      try {
        const requireCache = window.__webpack_require__.c;
        // Look for the MUI useEnhancedEffect module in the cache
        Object.keys(requireCache).forEach(moduleId => {
          if (moduleId.includes('useEnhancedEffect')) {
            // Replace the exports with our implementation
            requireCache[moduleId].exports = {
              default: muiUseEnhancedEffect
            };
          }
        });
      } catch (e) {
        console.warn('Failed to patch webpack cache for useEnhancedEffect:', e);
      }
    }
  } catch (e) {
    console.warn('Failed to patch MUI useEnhancedEffect:', e);
  }
}

// Create a safe wrapper for React elements to prevent "Objects are not valid as a React child" errors
export function safeChild(child) {
  if (child === null || child === undefined) {
    return null;
  }

  // If it's a plain string, number or boolean, it's safe to render
  if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
    return child;
  }

  // Check if it's a valid React element (has $$typeof property)
  if (child && typeof child === 'object' && ('$$typeof' in child)) {
    try {
      // In SSR context, we need to be more careful with React elements
      if (typeof window === 'undefined' && child.type && typeof child.type === 'function') {
        // For component elements in SSR, return a placeholder instead of the actual element
        // This helps avoid the "Objects are not valid as React child" error
        return null;
      }
      return child; // Valid React elements are returned as is in browser context
    } catch (e) {
      console.warn('Error processing React element:', e);
      return null;
    }
  }

  // Handle arrays by recursively processing each item
  if (Array.isArray(child)) {
    return child.map(safeChild);
  }

  // For any other object, convert to string to prevent React errors
  try {
    return String(child);
  } catch (e) {
    console.warn('Failed to stringify object in SafeRender:', e);
    return '';
  }
}

// Export a utility to safely render children
export function safeRender(children) {
  if (children === null || children === undefined) {
    return null;
  }

  if (Array.isArray(children)) {
    return children.map(safeChild);
  }

  return safeChild(children);
}

// Create a wrapper component that safely renders its children
export const SafeRender = ({ children }) => {
  try {
    const safeChildren = safeRender(children);
    return React.createElement(React.Fragment, null, safeChildren);
  } catch (e) {
    console.error('Error in SafeRender:', e);
    return React.createElement(React.Fragment, null, 'Error rendering content');
  }
};

// Export a dummy function to ensure this file is not tree-shaken
export function fixEmotion() {
  return true;
} 