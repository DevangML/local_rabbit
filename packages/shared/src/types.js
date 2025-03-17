/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [avatar] - Optional user avatar URL
 */

/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {T} data
 * @property {number} status
 * @property {string} message
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error
 * @property {number} status
 * @property {*} [details] - Optional error details
 */

// Export empty object to make this a proper ES module
export default {};