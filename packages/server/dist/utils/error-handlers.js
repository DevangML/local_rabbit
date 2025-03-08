/**
 * Error handling utilities
 */

/**
 * Safely extract error message from unknown error
 * @param {unknown} error - The error to extract message from
 * @param {string} [defaultMessage='Unknown error'] - Default message if extraction fails
 * @returns {string} The error message
 */
exports.getErrorMessage = (error, defaultMessage = 'Unknown error') => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }

  return defaultMessage;
};

/**
 * Create a wrapper for async controller functions to handle errors consistently
 * @param {Function} fn - The controller function to wrap
 * @returns {Function} The wrapped function
 */
exports.asyncHandler = (fn) => async (
  /** @type {import('express').Request} */ req,
  /** @type {import('express').Response} */ res,
  /** @type {import('express').NextFunction} */ next
) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Safely access properties of an object
 * @param {Record<string, any>} obj - The object to access
 * @param {string|string[]} path - The property path
 * @param {any} defaultValue - Default value if property doesn't exist
 * @returns {any} The property value or default value
 */
exports.safeGet = (obj, path, defaultValue = undefined) => {
  if (obj == null) return defaultValue;

  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== 'object') return defaultValue;
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
};

/**
 * Type check for arrays
 * @param {any} value - The value to check
 * @returns {boolean} True if value is an array
 */
exports.isArray = Array.isArray; 