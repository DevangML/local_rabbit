const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');
// @ts-ignore - Import simple-git with correct syntax
const simpleGitFactory = require('simple-git');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Helper function to validate paths before fs operations
 * @param {string|undefined} filePath - Path to validate
 * @param {string[]} [allowedPaths=[]] - List of allowed paths
 * @returns {boolean} - True if path is valid
 */
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
    // @ts-ignore - simpleGit is callable at runtime
    this.git = simpleGitFactory(repoPath);
    // Ensure the state directory exists
    const stateDir = path.join(__dirname, '..', '..', path.dirname(config.git.statePath));
    if (!fsSync.existsSync(stateDir)) {
      fsSync.mkdirSync(stateDir, { recursive: true });
    }
    this.stateFilePath = path.join(__dirname, '..', '..', config.git.statePath);
  }

  /**
   * Set the repository path
   * @param {string} repoPath - Path to the repository
   */
  setRepoPath(repoPath) {
    this.repoPath = repoPath;
    // @ts-ignore - simpleGit is callable at runtime
    this.git = simpleGitFactory(repoPath);
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
      return await this.git.branch();
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
      const { current } = await this.git.branch();
      return current;
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

      // Check if file exists
      if (!fsSync.existsSync(this.stateFilePath)) {
        logger.info('State file does not exist, creating empty state');
        await this.saveState();
        return '';
      }

      // Read and parse state file
      const stateContent = await fs.readFile(this.stateFilePath, 'utf8');
      const state = JSON.parse(stateContent);
      if (state && state.repoPath) {
        this.setRepoPath(state.repoPath);
        return state.repoPath;
      }
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
   * @returns {Promise<Array<{path: string, name: string}>>} - Array of repository objects
   */
  static async findRepositories() {
    const homeDir = os.homedir();
    /** @type {string[]} */
    const results = [];
    const checkedDirs = new Set();

    // Starting search locations
    const startLocations = [
      homeDir,
      path.join(homeDir, 'projects'),
      path.join(homeDir, 'workspace'),
      path.join(homeDir, 'repositories'),
      path.join(homeDir, 'git'),
      path.join(homeDir, 'src'),
      path.join(homeDir, 'Documents'),
      path.join(homeDir, 'code'),
      // Add common project directories
    ];

    logger.info(`Searching for Git repositories in common locations...`);

    /**
     * @param {string} dir
     * @param {number} depth
     */
    const scanForGitRepos = async (dir, depth = 0) => {
      // Don't scan too deep
      if (depth > 3) return;

      // Skip if we've already checked this directory
      const normalizedDir = path.normalize(dir);
      if (checkedDirs.has(normalizedDir)) return;
      checkedDirs.add(normalizedDir);

      try {
        // Check if this directory is a git repo
        const gitDir = path.join(dir, '.git');
        if (fsSync.existsSync(gitDir) && fsSync.statSync(gitDir).isDirectory()) {
          results.push(dir);
          return; // Found a repo, don't scan deeper
        }

        // Limit total repositories to prevent excessive scanning
        if (results.length >= 25) return;

        // Scan subdirectories
        const items = await fs.readdir(dir, { withFileTypes: true });

        if (items && items.length > 0) {
          // @ts-ignore - fs.Dirent is the correct type but TypeScript doesn't recognize it
          const subdirs = items
            .filter((/** @type {{isDirectory: () => boolean}} */ item) => item.isDirectory())
            .map((/** @type {{isDirectory: () => boolean, name: string}} */ item) => path.join(dir, item.name));

          // Check each subdirectory for .git folder (with a reasonable limit)
          const checkLimit = Math.min(subdirs.length, 25); // limit to 25 directories per parent
          for (let i = 0; i < checkLimit; i++) {
            await scanForGitRepos(subdirs[i], depth + 1);
          }
        }
      } catch (error) {
        // Silently skip directories we can't access
      }
    };

    for (const dir of startLocations) {
      await scanForGitRepos(dir);
    }

    logger.info(`Found ${results.length} repositories`);
    return results.map(repoPath => ({
      path: repoPath,
      name: path.basename(repoPath)
    }));
  }

  /**
   * Check if the given path is a valid Git repository
   * @param {string} dirPath - Path to the directory
   * @returns {Promise<boolean>} - True if valid Git repository
   */
  async isGitRepository(dirPath) {
    try {
      // @ts-ignore - simpleGit is callable at runtime
      const git = simpleGitFactory(dirPath);
      return await git.checkIsRepo();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the content of a file at a specific commit or branch
   * @param {string} filePath - Path to the file
   * @param {string} ref - Commit hash or branch name
   * @returns {Promise<string>} - File content
   */
  async getFileContent(filePath, ref) {
    try {
      return await this.git.show([`${ref}:${filePath}`]);
    } catch (error) {
      logger.error(`Error getting file content for ${filePath} at ${ref}:`, error);
      throw error;
    }
  }

  /**
   * Get the commit history of a branch
   * @param {string} branch - Branch name
   * @param {number} [maxCount=100] - Maximum number of commits to retrieve
   * @returns {Promise<Object>} - Commit history
   */
  async getCommitHistory(branch, maxCount = 100) {
    try {
      return await this.git.log({
        maxCount,
        branch,
      });
    } catch (error) {
      logger.error('Error getting commit history:', error);
      throw error;
    }
  }

  /**
   * Get the status of the repository
   * @returns {Promise<Object>} - Repository status
   */
  async getStatus() {
    try {
      return await this.git.status();
    } catch (error) {
      logger.error('Error getting git status:', error);
      throw error;
    }
  }
}

module.exports = GitService;
