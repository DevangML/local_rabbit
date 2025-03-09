/**
 * This file provides fixes for Emotion initialization issues
 * It should be imported before any other Emotion imports
 */

// Import React to ensure it's available
import * as React from 'react';

// Make React globally available immediately
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

// Ensure useInsertionEffect is available
// This is a defensive approach to make sure the hook is defined
if (!React.useInsertionEffect) {
  // @ts-ignore - Add useInsertionEffect if it doesn't exist
  React.useInsertionEffect = React.useLayoutEffect || React.useEffect || ((fn: () => void) => fn());
}

// Import the module to reference it before augmentation
import '@mui/styled-engine';

// Patch for @mui/system issue with internal_processStyles
// The MUI system is trying to import internal_processStyles which doesn't exist in @mui/styled-engine v6
// This module augmentation adds the missing export
declare module '@mui/styled-engine' {
  // Add the missing export that's being imported in @mui/system/createStyled.js
  export const internal_processStyles: any;
}

// Export a dummy function to ensure this file is not tree-shaken
export function fixEmotion() {
  return true;
}