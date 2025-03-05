const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');
const logger = require('../utils/logger');
const config = require('../config');

// Helper function to validate paths before fs operations
const validatePath = (filePath, allowedPaths = []) => {
  if (!filePath) return false;

  const normalizedPath = path.normalize(filePath);

  // Check for path traversal attempts
  if (normalizedPath.includes('..')) return false;

  // If allowedPaths is provided, check against the whitelist
  if (allowedPaths.length > 0) {
    return allowedPaths.some((allowedPath) => {
      const normalizedAllowedPath = path.normalize(allowedPath);
      return normalizedPath.startsWith(normalizedAllowedPath);
    });
  }

  // Default validation - check if path is absolute and within safe directories
  const safeDirectories = [
    path.resolve(__dirname, '..', '..'), // Project root
    os.homedir(),
  ];

  return safeDirectories.some((safeDir) => normalizedPath.startsWith(safeDir));
};

class GitService {
  constructor(repoPath = '') {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
    this.stateFilePath = path.join(__dirname, '..', '..', config.git.statePath);
  }

  /**
   * Set the repository path
   * @param {string} repoPath - Path to the repository
   */
  setRepoPath(repoPath) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  /**
   * Check if the current path is a valid Git repository
   * @returns {Promise<boolean>} - True if valid Git repository
   */
  async isValidRepo() {
    try {
      return await this.git.checkIsRepo();
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
      return await this.git.branchLocal();
    } catch (error) {
      logger.error('Error getting branches:', error);
      throw error;
    }
  }

  /**
   * Get the current branch
   * @returns {Promise<string>} - Current branch name
   */
  async getCurrentBranch() {
    try {
      return (await this.git.branch()).current;
    } catch (error) {
      logger.error('Error getting current branch:', error);
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
      return await this.git.diff([fromBranch, toBranch]);
    } catch (error) {
      logger.error('Error getting diff:', error);
      throw error;
    }
  }

  /**
   * Load repository path from state file
   * @returns {Promise<string>} - Repository path
   */
  async loadState() {
    try {
      logger.info('Loading state from:', this.stateFilePath);

      // Validate path before file operations
      if (!validatePath(this.stateFilePath)) {
        logger.error('Invalid state file path');
        return '';
      }

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      if (fsSync.existsSync(this.stateFilePath)) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const data = await fs.readFile(this.stateFilePath, 'utf8');
        const state = JSON.parse(data);
        this.repoPath = state.repoPath || '';
        this.git = simpleGit(this.repoPath);
        logger.info('Loaded repository path:', this.repoPath);
        return this.repoPath;
      }
      logger.info('No state file exists yet');
      return '';
    } catch (error) {
      logger.error('Error loading state:', error);
      return '';
    }
  }

  /**
   * Save repository path to state file
   * @returns {Promise<void>}
   */
  async saveState() {
    try {
      logger.info('Saving state, repoPath:', this.repoPath);

      // Validate path before file operations
      if (!validatePath(this.stateFilePath)) {
        throw new Error('Invalid state file path');
      }

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(this.stateFilePath, JSON.stringify({ repoPath: this.repoPath }));
      logger.info('State saved successfully');
    } catch (error) {
      logger.error('Error saving state:', error);
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
      // Common places to find repositories
      const commonDirs = [
        path.join(homeDir, 'Documents'),
        path.join(homeDir, 'Projects'),
        path.join(homeDir, 'Development'),
        path.join(homeDir, 'Code'),
        path.join(homeDir, 'Github'),
      ];

      // Add the current directory to the list for testing
      const currentDir = process.cwd();
      commonDirs.push(path.dirname(currentDir));

      logger.info('Searching for repositories in directories:', commonDirs);

      const repositories = [];
      const validDirs = [];

      // First validate all directories before attempting to search them
      for (const dir of commonDirs) {
        if (validatePath(dir)) {
          try {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            const dirStat = await fs.stat(dir).catch(() => null);
            if (dirStat && dirStat.isDirectory()) {
              validDirs.push(dir);
            }
          } catch (error) {
            logger.warn(`Error checking directory ${dir}:`, error.message);
          }
        }
      }

      logger.info('Valid directories to search:', validDirs);

      // Process each directory one by one (safer than parallel)
      for (const dir of validDirs) {
        try {
          // Get subdirectories
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          const items = await fs.readdir(dir, { withFileTypes: true }).catch((err) => {
            logger.warn(`Error reading directory ${dir}:`, err.message);
            return [];
          });

          if (!items || !items.length) continue;

          const subdirs = items
            .filter((item) => item.isDirectory())
            .map((item) => path.join(dir, item.name));

          // Check each subdirectory for .git folder (with a reasonable limit)
          const checkLimit = Math.min(subdirs.length, 25); // limit to 25 directories per parent
          logger.info(`Checking ${checkLimit} subdirectories in ${dir}`);

          for (let i = 0; i < checkLimit; i++) {
            const subdir = subdirs[i];
            try {
              // Skip if path validation fails
              if (!validatePath(subdir)) continue;

              const gitDir = path.join(subdir, '.git');
              if (!validatePath(gitDir)) continue;

              // Check if .git directory exists
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              const gitDirStat = await fs.stat(gitDir).catch(() => null);
              if (!gitDirStat || !gitDirStat.isDirectory()) continue;

              // It's a git repository - add it without doing any git operations that might hang
              repositories.push({
                path: subdir,
                name: path.basename(subdir),
              });
            } catch (error) {
              logger.warn(`Error checking repository ${subdir}:`, error.message);
            }
          }
        } catch (error) {
          logger.warn(`Error processing directory ${dir}:`, error.message);
        }
      }

      logger.info(`Found ${repositories.length} repositories`);
      return repositories;
    } catch (error) {
      logger.error('Error finding repositories:', error);
      return [];
    }
  }
}

module.exports = GitService;
