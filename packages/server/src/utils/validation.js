const path = require('path');
const os = require('os');
const config = require('../config');

class ValidationUtils {
  static isValidPath(filePath) {
    if (!filePath) return false;

    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..')) return false;

    const { allowedDirs } = config.git;
    return allowedDirs.some((dir) => normalizedPath.startsWith(dir));
  }

  static isValidBranchName(branchName) {
    if (!branchName || typeof branchName !== 'string') return false;

    // Git branch naming rules - replace the control character regex
    // Using a safer approach that doesn't use control characters directly
    const invalidChars = /[\s~^:?*[\\\]]/;
    const reservedNames = /^[-@]|[.][.]|[.]$|^[/]|[/]$|[/]{2}|@{|^@$/;

    return !invalidChars.test(branchName) && !reservedNames.test(branchName);
  }

  static sanitizePath(filePath) {
    if (!filePath) return '';

    // Expand tilde to home directory
    const expandedPath = filePath.startsWith('~')
      ? path.join(os.homedir(), filePath.slice(1))
      : filePath;

    return path.normalize(expandedPath);
  }

  static validateRepositoryRequest(req) {
    const errors = [];

    if (!req.body.path) {
      errors.push('Repository path is required');
    } else if (!this.isValidPath(req.body.path)) {
      errors.push('Invalid repository path');
    }

    return errors;
  }

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
