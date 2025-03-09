/**
 * React Hooks Initialization
 * 
 * This file ensures React hooks are properly initialized and available in all environments.
 * It provides safe fallbacks for hooks that might not be available in certain environments.
 */

import React from 'react';

// Detect server-side rendering environment
const isServer = typeof window === 'undefined';

// Create fallbacks for hooks that may not be available
if (!React.useLayoutEffect) {
  React.useLayoutEffect = React.useEffect;
}

// Make sure useInsertionEffect has a fallback
if (!React.useInsertionEffect) {
  React.useInsertionEffect = isServer ? React.useEffect : React.useLayoutEffect;
}

// Export React to ensure it's used
export default React; 