const simpleGit = require('simple-git');
const path = require('path');
const os = require('os');
const logger = require('../utils/logger');

/**
 * Expand tilde in paths (e.g., "~/Documents" becomes "/Users/username/Documents")
 * @param {string} filePath - Path that may contain tilde
 * @returns {string} - Path with tilde expanded
 */
const expandTilde = (filePath) => {
  if (!filePath) return filePath;

  // If path starts with ~/ or ~\, replace it with home directory
  if (filePath.startsWith('~/') || filePath.startsWith('~\\')) {
    return path.join(os.homedir(), filePath.substring(2));
  }

  // If path is just ~, return home directory
  if (filePath === '~') {
    return os.homedir();
  }

  return filePath;
};

/**
 * Helper function to validate if a path is safe to use
 * @param {string} filePath - Path to validate
 * @returns {boolean} - True if path is safe
 */
const isPathSafe = (filePath) => {
  if (!filePath) return false;

  // Expand tilde if present
  const expandedPath = expandTilde(filePath);
  const normalizedPath = path.normalize(expandedPath);

  // Check for path traversal attempts
  if (normalizedPath.includes('..')) return false;

  // Only allow paths in specific directories
  const homeDir = os.homedir();
  const allowedDirs = [
    path.join(homeDir, 'Documents'),
    path.join(homeDir, 'Projects'),
    path.join(homeDir, 'Development'),
    path.join(homeDir, 'Code'),
    path.join(homeDir, 'Github'),
    path.join(homeDir, 'repos'),
    path.join(homeDir, 'git'),
    path.join(homeDir, 'workspace'),
    path.join(homeDir, 'dev'),
    path.join(homeDir, 'Desktop'),
  ];

  return allowedDirs.some((dir) => normalizedPath.startsWith(dir));
};

/**
 * SecureGitService - A service that only uses Git repositories as path references
 * without accessing or storing project files
 */
class SecureGitService {
  constructor() {
    this.currentRepoPath = '';
    this.git = null;
  }

  /**
   * Set the current repository path
   * @param {string} repoPath - Path to the repository
   * @returns {boolean} - True if path is valid and set successfully
   */
  setRepositoryPath(repoPath) {
    // Expand tilde if present
    const expandedPath = expandTilde(repoPath);

    if (!isPathSafe(expandedPath)) {
      logger.error('Repository path is not safe:', expandedPath);
      return false;
    }

    this.currentRepoPath = expandedPath;
    this.git = simpleGit(expandedPath);
    return true;
  }

  /**
   * Get the current repository path
   * @returns {string} - Current repository path
   */
  getRepositoryPath() {
    return this.currentRepoPath;
  }

  /**
   * Check if the current path is a valid Git repository
   * @param {string} repoPath - Optional path to check
   * @returns {Promise<boolean>} - True if valid Git repository
   */
  async isValidRepo(repoPath = null) {
    try {
      const pathToCheck = repoPath || this.currentRepoPath;

      if (!pathToCheck || !isPathSafe(pathToCheck)) {
        return false;
      }

      const git = repoPath ? simpleGit(repoPath) : this.git;
      return await git.checkIsRepo();
    } catch (error) {
      logger.error('Error checking if valid repo:', error);
      return false;
    }
  }

  /**
   * Get all branches in the repository
   * @returns {Promise<Object>} - Object containing branch information
   */
  async getBranches() {
    try {
      if (!this.git || !this.currentRepoPath) {
        throw new Error('No repository selected');
      }

      return await this.git.branchLocal();
    } catch (error) {
      logger.error('Error getting branches:', error);
      throw error;
    }
  }

  /**
   * Get diff between two branches
   * @param {string} fromBranch - Source branch
   * @param {string} toBranch - Target branch
   * @returns {Promise<string>} - Diff output
   */
  async getDiff(fromBranch, toBranch) {
    try {
      if (!this.git || !this.currentRepoPath) {
        throw new Error('No repository selected');
      }

      if (!fromBranch || !toBranch) {
        throw new Error('Both branches must be specified');
      }

      return await this.git.diff([fromBranch, toBranch]);
    } catch (error) {
      logger.error('Error getting diff:', error);
      throw error;
    }
  }

  /**
   * Find Git repositories in common directories
   * @returns {Promise<Array>} - Array of repository objects
   */
  static async findRepositories() {
    try {
      const homeDir = os.homedir();
      const commonDirs = [
        path.join(homeDir, 'Documents'),
        path.join(homeDir, 'Projects'),
        path.join(homeDir, 'Development'),
        path.join(homeDir, 'Code'),
        path.join(homeDir, 'Github'),
      ];

      const repositories = [];

      // Process all common directories in parallel
      await Promise.all(commonDirs.map(async (dir) => {
        try {
          // Skip if path is not safe
          if (!isPathSafe(dir)) return;

          // We need to check if directory exists, but we don't want to access its contents
          // We only use the path to check if it's a Git repository
          const git = simpleGit(dir);
          const isRepo = await git.checkIsRepo().catch(() => false);

          if (isRepo) {
            repositories.push({
              path: dir,
              name: path.basename(dir),
            });
            return;
          }

          // If the directory itself is not a Git repository, we'll check its immediate subdirectories
          // This is a common pattern where users have multiple repositories in a parent directory
          const { stdout } = await git.raw(['ls-files', '--directory', '--others', '--exclude-standard']);

          if (!stdout) return;

          const subdirs = stdout.split('\n')
            .filter(Boolean)
            .map((subdir) => path.join(dir, subdir));

          // Check each subdirectory for .git folder in parallel
          await Promise.all(subdirs.map(async (subdir) => {
            try {
              // Skip if path is not safe
              if (!isPathSafe(subdir)) return;

              const subGit = simpleGit(subdir);
              const isSubRepo = await subGit.checkIsRepo().catch(() => false);

              if (isSubRepo) {
                repositories.push({
                  path: subdir,
                  name: path.basename(subdir),
                });
              }
            } catch (error) {
              // Skip this subdirectory if there's an error
            }
          }));
        } catch (error) {
          // Skip this directory if there's an error
        }
      }));

      return repositories;
    } catch (error) {
      logger.error('Error finding repositories:', error);
      return [];
    }
  }
}

module.exports = SecureGitService;
