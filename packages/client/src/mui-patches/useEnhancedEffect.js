/**
 * Complete replacement for MUI's useEnhancedEffect
 * 
 * This is a standalone implementation that doesn't import anything from React
 * and therefore doesn't attempt to access React.useLayoutEffect, which is causing
 * the error in SSR environments.
 */

// Skip import of React entirely to avoid any issues
// import { useEffect } from 'react'; 

/**
 * Enhanced Effect Hook Patch
 * 
 * This is a safe implementation of useEnhancedEffect for SSR.
 * It replaces MUI's useLayoutEffect (browser) / useEffect (server) pattern
 * with a simple synchronous execution that works in both environments.
 * 
 * @param {Function} callback The effect callback
 * @returns {Function} Empty cleanup function
 */
function useEnhancedEffect(callback) {
  // In a "real" implementation, this would be useLayoutEffect in the browser
  // and useEffect on the server, but for now we'll just execute the callback
  // immediately to avoid any hook-related errors
  if (typeof callback === 'function') {
    try {
      // Instead of executing the callback synchronously which can cause issues with 
      // React elements during SSR, we'll defer it or do nothing in SSR context
      if (typeof window !== 'undefined') {
        // We're in browser context, safe to run the callback
        callback();
      }
      // In SSR context, we don't run the callback to avoid rendering issues
    } catch (e) {
      console.error('Error in useEnhancedEffect callback:', e);
    }
  }

  // Return an empty cleanup function
  return function cleanup() { };
}

// Export for ESM (Vite/Rollup)
export default useEnhancedEffect;
export { useEnhancedEffect };

// For CommonJS compatibility
if (typeof module !== 'undefined') {
  module.exports = useEnhancedEffect;
  module.exports.default = useEnhancedEffect;
  module.exports.__esModule = true;
} 