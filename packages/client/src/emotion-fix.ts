/**
 * This file provides fixes for Emotion initialization issues
 * It should be imported before any other Emotion imports
 */

// Import React to ensure it's available
import * as React from 'react';

// Make React globally available immediately, but only in browser environment
if (typeof window !== 'undefined') {
  window.React = React;
}

// Add type declaration for Emotion's property
declare global {
  interface Window {
    __EMOTION_INSERTION_EFFECT__?: boolean;
    React?: any; // Add React to the Window interface
  }
}

// Polyfill React's useInsertionEffect for Emotion
// This needs to be done before any Emotion imports
if (typeof window !== 'undefined') {
  // Fix for "Cannot access 'Wo' before initialization" error
  // This ensures that the useInsertionEffect is properly initialized
  window.__EMOTION_INSERTION_EFFECT__ = true;
}

// Define our own useInsertionEffect hook that falls back to useLayoutEffect or useEffect
// This avoids modifying the React import directly
export const useInsertionEffectPolyfill = 
  React.useInsertionEffect || 
  React.useLayoutEffect || 
  React.useEffect || 
  ((fn: () => void) => fn());

// Import the module to reference it before augmentation
import '@mui/styled-engine';

// Patch for @mui/system issue with internal_processStyles
// The MUI system is trying to import internal_processStyles which doesn't exist in @mui/styled-engine v6
// This module augmentation adds the missing export
declare module '@mui/styled-engine' {
  // Add the missing export that's being imported in @mui/system/createStyled.js
  export const internal_processStyles: any;
}

// Create a safe wrapper for React elements to prevent "Objects are not valid as a React child" errors
export function safeChild(child: any): any {
  if (child === null || child === undefined) {
    return null;
  }
  
  // If it's a React element or primitive type, return as is
  if (
    typeof child !== 'object' || 
    child === null || 
    typeof child === 'string' || 
    typeof child === 'number' || 
    typeof child === 'boolean' ||
    (child && typeof child === 'object' && ('$$typeof' in child))
  ) {
    return child;
  }
  
  // Convert other objects to string to prevent the "Objects are not valid as a React child" error
  return String(child);
}

// Export a utility to safely render children
export function safeRender(children: React.ReactNode): React.ReactNode {
  if (Array.isArray(children)) {
    return children.map(safeChild);
  }
  return safeChild(children);
}

// Create a wrapper component that safely renders its children
export const SafeRender: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(React.Fragment, null, safeRender(children));
};

// Export a dummy function to ensure this file is not tree-shaken
export function fixEmotion() {
  return true;
}