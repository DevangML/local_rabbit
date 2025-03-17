/**
 * Module intercept hook for Node.js
 * This file patches the require.extensions to intercept specific modules and provide patched versions
 */

import { createRequire } from 'module';
import Module from 'module';

const require = createRequire(import.meta.url);
const originalRequire = Module.prototype.require;

// Safe implementation of useEnhancedEffect
/**
 * @param {Function} callback - The effect callback function
 * @returns {Function} Cleanup function
 */
const safeUseEnhancedEffect = function useEnhancedEffect(callback) {
  if (typeof callback === 'function') {
    try {
      // Execute callback directly
      callback();
    } catch (e) {
      console.error('Error in useEnhancedEffect:', e);
    }
  }
  return function cleanup() { };
};

// Create a replacement module for useEnhancedEffect
const useEnhancedEffectReplacement = {
  __esModule: true,
  default: safeUseEnhancedEffect
};

// Install the hook
function installHook() {
  // Patch the require function to intercept specific modules
  /**
   * @param {string} id - Module identifier
   * @returns {any} Module exports
   */
  Module.prototype.require = function (id) {
    // Handle specific modules that cause issues
    if (id.includes('@mui/utils/useEnhancedEffect') ||
      id.includes('@mui/material/utils/useEnhancedEffect') ||
      id.includes('@mui/base/utils/useEnhancedEffect') ||
      id.includes('@mui/system/useEnhancedEffect') ||
      id.includes('@mui/private-theming/useEnhancedEffect')) {
      console.log(`[requireHook] Intercepted require for ${id}`);
      return useEnhancedEffectReplacement;
    }

    // For all other modules, use the original require
    return originalRequire.apply(this, arguments);
  };

  console.log('[requireHook] Installed require hook for MUI modules');
}

// Install the hook
installHook();

// Export the hook for other modules to use
export {
  installHook,
  safeUseEnhancedEffect
}; 