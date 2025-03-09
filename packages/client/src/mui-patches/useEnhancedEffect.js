/**
 * Patched version of MUI's useEnhancedEffect
 * 
 * This fixes the "Cannot read properties of undefined (reading 'useLayoutEffect')" error
 * by providing a safe implementation of useEnhancedEffect that works in both browser and server environments.
 */

import * as React from 'react';

// Detect server-side rendering environment
const isServer = typeof window === 'undefined';

// Use useEffect on the server (which is a no-op in SSR)
// Use useLayoutEffect in the browser (for synchronous effects like measuring)
const useEnhancedEffect = isServer ? React.useEffect : React.useLayoutEffect;

export default useEnhancedEffect; 