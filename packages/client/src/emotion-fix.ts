/**
 * This file provides fixes for Emotion initialization issues
 * It should be imported before any other Emotion imports
 */

// Ensure React is properly defined for Emotion
if (typeof window !== 'undefined') {
  // Fix for "Cannot access 'Wo' before initialization" error
  // This ensures that the useInsertionEffect is properly initialized
  window.__EMOTION_INSERTION_EFFECT__ = true;
}

// Export a dummy function to ensure this file is not tree-shaken
export function fixEmotion() {
  return true;
}