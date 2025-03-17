export * from './types';
export * from './utils';
export * from './components/ErrorBoundary';

// Common types - converted to JSDoc for documentation
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 */

// Common utilities
/**
 * Format a date using US locale
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Constants
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
};

// Environment helpers
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};