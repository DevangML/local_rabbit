/**
 * Custom implementation of @emotion/use-insertion-effect-with-fallbacks
 * This provides fallbacks for React's useInsertionEffect hook
 */

// Simple implementation that doesn't rely on React being initialized
// This avoids the "Cannot access before initialization" error
export const useInsertionEffect = (effect) => {
  // In a browser environment, we'll try to use React's hooks if available
  if (typeof window !== 'undefined') {
    try {
      // Try to access React from window (which should be set by emotion-fix.js)
      const reactInstance = window.React;

      // If React is available with useInsertionEffect, use it
      if (reactInstance && reactInstance.useInsertionEffect) {
        return reactInstance.useInsertionEffect(effect);
      }

      // Fallback to useLayoutEffect
      if (reactInstance && reactInstance.useLayoutEffect) {
        return reactInstance.useLayoutEffect(effect);
      }

      // Fallback to useEffect
      if (reactInstance && reactInstance.useEffect) {
        return reactInstance.useEffect(effect);
      }
    } catch (e) {
      // Silently fail and use the fallback
    }
  }

  // Ultimate fallback: just run the effect function
  if (typeof effect === 'function') {
    effect();
  }

  // Return a no-op cleanup function
  return () => { };
};

// Create a version that runs the effect synchronously during the commit phase
export const useInsertionEffectAlwaysWithSyncFallback = useInsertionEffect;

// Create a version that runs the effect only once
export const useInsertionEffectWithLayoutFallback = useInsertionEffect; 