/**
 * Format a date with time using US locale
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Check if code is running on the server
 * @returns {boolean} True if running on server
 */
export function isServer() {
  return typeof window === 'undefined';
}

/**
 * Create a delay for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} Promise that resolves after the delay
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a URL query string from an object of parameters
 * @param {Object<string, string>} params - Key-value pairs to encode
 * @returns {string} Encoded query string (without the leading ?)
 */
export function createQueryString(params) {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}