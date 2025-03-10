/**
 * Monkey patch script for MUI libraries
 * 
 * This script directly modifies the require.cache to replace problematic
 * modules with our patched versions. This is more direct than using aliases.
 */

// Create a safe way to access global objects that might be undefined
const safeGlobal = typeof window !== 'undefined' ? window :
  typeof global !== 'undefined' ? global :
    {};

// Safe implementation that doesn't use any React hooks
const safeUseEnhancedEffect = function useEnhancedEffect(callback) {
  // Check if we're in browser context
  const isBrowser = typeof window !== 'undefined';

  if (typeof callback === 'function' && isBrowser) {
    try {
      callback();
    } catch (e) {
      console.error('Error in useEnhancedEffect:', e);
    }
  }
  return function cleanup() { };
};

// Make the safe implementation globally available
if (safeGlobal) {
  safeGlobal.safeUseEnhancedEffect = safeUseEnhancedEffect;
}

// Apply patches when the module is loaded
function applyPatches() {
  // Check if we have access to require
  const hasRequire = typeof require !== 'undefined' && require.cache;

  if (hasRequire) {
    console.log('Applying MUI patches...');

    // Search for useEnhancedEffect modules in the require cache
    Object.keys(require.cache).forEach(id => {
      // Check if this is a useEnhancedEffect module
      if (id.includes('@mui') && id.includes('useEnhancedEffect')) {
        console.log('Patching MUI module:', id);

        // Replace the exports with our safe implementation
        try {
          require.cache[id].exports = safeUseEnhancedEffect;
        } catch (e) {
          console.error('Failed to patch module:', id, e);
        }
      }
    });
  }
}

// Try to apply patches immediately
try {
  applyPatches();
} catch (e) {
  console.error('Error applying MUI patches:', e);
}

// Export patches for direct use
export const useEnhancedEffect = safeUseEnhancedEffect;
export default safeUseEnhancedEffect; 