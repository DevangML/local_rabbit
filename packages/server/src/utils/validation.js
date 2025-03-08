const path = require('path');
const os = require('os');
const config = require('../config');

/**
 * @typedef {Object} GitConfig
 * @property {string} statePath - Path to the git state file
 * @property {string} defaultBranch - Default branch name
 * @property {number} maxDiffSize - Maximum diff size
 * @property {string[]} [allowedDirs] - Allowed directories for git operations
 */

/**
 * @typedef {Object} RequestBody
 * @property {string} [path] - Repository path
 * @property {string} [fromBranch] - Source branch name
 * @property {string} [toBranch] - Target branch name
 */

/**
 * @typedef {Object} Request
 * @property {RequestBody} body - Request body
 */

// Extend the config.git object with allowedDirs if it doesn't exist
/** @type {GitConfig} */
const gitConfig = config.git;
if (!gitConfig.allowedDirs) {
  gitConfig.allowedDirs = [process.cwd()]; // Default to current working directory
}

class ValidationUtils {
  /**
   * Validates if a file path is valid
   * @param {string} filePath - The file path to validate
   * @returns {boolean} - Whether the path is valid
   */
  static isValidPath(filePath) {
    if (!filePath) return false;

    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..')) return false;

    const { allowedDirs = [process.cwd()] } = /** @type {GitConfig} */ (config.git);
    return allowedDirs.some((/** @type {string} */ dir) => normalizedPath.startsWith(dir));
  }

  /**
   * Validates if a branch name is valid
   * @param {string} branchName - The branch name to validate
   * @returns {boolean} - Whether the branch name is valid
   */
  static isValidBranchName(branchName) {
    if (!branchName || typeof branchName !== 'string') return false;

    // Git branch naming rules - replace the control character regex
    // Using a safer approach that doesn't use control characters directly
    const invalidChars = /[\s~^:?*[\\\]]/;
    const reservedNames = /^[-@]|[.][.]|[.]$|^[/]|[/]$|[/]{2}|@{|^@$/;

    return !invalidChars.test(branchName) && !reservedNames.test(branchName);
  }

  /**
   * Sanitizes a file path
   * @param {string} filePath - The file path to sanitize
   * @returns {string} - The sanitized path
   */
  static sanitizePath(filePath) {
    if (!filePath) return '';

    // Expand tilde to home directory
    const expandedPath = filePath.startsWith('~')
      ? path.join(os.homedir(), filePath.slice(1))
      : filePath;

    return path.normalize(expandedPath);
  }

  /**
   * Validates a repository request
   * @param {Request} req - The request object
   * @returns {string[]} - Array of error messages
   */
  static validateRepositoryRequest(req) {
    const errors = [];

    if (!req.body.path) {
      errors.push('Repository path is required');
    } else if (!this.isValidPath(req.body.path)) {
      errors.push('Invalid repository path');
    }

    return errors;
  }

  /**
   * Validates a diff request
   * @param {Request} req - The request object
   * @returns {string[]} - Array of error messages
   */
  static validateDiffRequest(req) {
    const errors = [];

    if (!req.body.fromBranch) {
      errors.push('Source branch is required');
    } else if (!this.isValidBranchName(req.body.fromBranch)) {
      errors.push('Invalid source branch name');
    }

    if (!req.body.toBranch) {
      errors.push('Target branch is required');
    } else if (!this.isValidBranchName(req.body.toBranch)) {
      errors.push('Invalid target branch name');
    }

    return errors;
  }

  /**
   * Validates if a git operation is valid
   * @param {string} operation - The git operation to validate
   * @returns {boolean} - Whether the operation is valid
   */
  static isValidGitOperation(operation) {
    const allowedOperations = [
      'status',
      'branch',
      'checkout',
      'pull',
      'fetch',
      'diff',
    ];
    return allowedOperations.includes(operation);
  }
}

module.exports = ValidationUtils;
