const path = require('path');
const os = require('os');
const fs = require('fs').promises;
const { exec } = require('child_process');
const logger = require('../utils/logger');

class SecureGitService {
  constructor() {
    this.currentRepoPath = null;
    this.allowedDirectories = [
      'Documents', 'Projects', 'Development', 'Code',
      'Github', 'repos', 'git', 'workspace', 'dev', 'Desktop',
    ].map((dir) => path.join(os.homedir(), dir));
  }

  /**
   * Set the current repository path
   * @param {string} repoPath - Path to the repository
   * @returns {boolean} - Whether the path was set successfully
   */
  setRepositoryPath(repoPath) {
    if (!repoPath) return false;

    const expandedPath = repoPath.startsWith('~')
      ? path.join(os.homedir(), repoPath.slice(1))
      : repoPath;

    const normalizedPath = path.normalize(expandedPath);

    if (this.isPathAllowed(normalizedPath)) {
      this.currentRepoPath = normalizedPath;
      return true;
    }

    logger.warn(`Attempted access to unauthorized path: ${normalizedPath}`);
    return false;
  }

  getRepositoryPath() {
    return this.currentRepoPath;
  }

  /**
   * Check if a path is allowed
   * @param {string} pathToCheck - Path to check
   * @returns {boolean} - Whether the path is allowed
   */
  isPathAllowed(pathToCheck) {
    return this.allowedDirectories.some((dir) => pathToCheck.startsWith(dir) && !pathToCheck.includes('..'));
  }

  /**
   * Check if a path is a valid Git repository
   * @param {string} repoPath - Path to check
   * @returns {Promise<boolean>} - Whether the path is a valid Git repository
   */
  async isValidRepo(repoPath) {
    if (!repoPath) return false;
    try {
      const gitDir = path.join(repoPath, '.git');
      await fs.access(gitDir);
      return true;
    } catch {
      return false;
    }
  }

  async getBranches() {
    if (!this.currentRepoPath) {
      throw new Error('No repository selected');
    }

    return new Promise((resolve, reject) => {
      const repoPath = String(this.currentRepoPath);
      exec('git branch', { cwd: repoPath },
        /** 
         * @param {Error|null} error 
         * @param {string} stdout 
         * @param {string} _stderr 
         */
        (error, stdout, _stderr) => {
          if (error) {
            logger.error(`Error getting branches: ${error.message}`);
            return reject(error);
          }

          const all = stdout
            .split('\n')
            .map(/** @param {string} branch */(branch) => branch.trim())
            .filter(/** @param {string} branch */(branch) => branch)
            .map(/** @param {string} branch */(branch) => branch.replace('* ', '')); // Remove the asterisk from current branch

          const current = stdout
            .split('\n')
            .find(/** @param {string} branch */(branch) => branch.trim().startsWith('* '));

          const currentBranch = current ? current.replace('* ', '').trim() : '';

          resolve({
            all,
            current: currentBranch,
          });
        });
    });
  }

  /**
   * Get diff between two branches
   * @param {string} fromBranch - Source branch
   * @param {string} toBranch - Target branch
   * @returns {Promise<Array<{status: string, file: string}>>} - List of changed files with status
   */
  async getDiff(fromBranch, toBranch) {
    if (!this.currentRepoPath) {
      throw new Error('No repository selected');
    }

    if (!fromBranch || !toBranch) {
      throw new Error('Both branches must be specified');
    }

    return new Promise((resolve, reject) => {
      const cmd = `git diff --name-status ${fromBranch}..${toBranch}`;
      const repoPath = String(this.currentRepoPath);
      exec(cmd, { cwd: repoPath },
        /** 
         * @param {Error|null} error 
         * @param {string} stdout 
         * @param {string} _stderr 
         */
        (error, stdout, _stderr) => {
          if (error) {
            logger.error(`Error getting diff: ${error.message}`);
            return reject(error);
          }

          const changes = stdout
            .split('\n')
            .filter(/** @param {string} line */(line) => line.trim())
            .map(/** @param {string} line */(line) => {
              const [status, file] = line.split('\t');
              return {
                status: status || '',
                file: file || ''
              };
            });

          resolve(changes);
        });
    });
  }

  /**
   * Find Git repositories in common directories
   * @returns {Promise<Array<{path: string, name: string}>>} - Array of repository objects
   */
  static async findRepositories() {
    /** @type {Array<{path: string, name: string}>} */
    const repos = [];
    const searchDirs = [
      'Documents', 'Projects', 'Development', 'Code',
      'Github', 'repos', 'git', 'workspace', 'dev', 'Desktop',
    ].map((dir) => path.join(os.homedir(), dir));

    for (const dir of searchDirs) {
      try {
        await this.searchDirectory(dir, repos);
      } catch (error) {
        logger.error(`Error searching directory ${dir}:`, error);
      }
    }

    return repos;
  }

  /**
   * Recursively search directory for Git repositories
   * @param {string} dir - Directory to search
   * @param {Array<{path: string, name: string}>} repos - Array to store found repositories
   * @param {number} [depth=0] - Current search depth
   */
  static async searchDirectory(dir, repos, depth = 0) {
    if (depth > 3) return;

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      if (entries.some((/** @type {import('fs').Dirent} */ entry) => entry.name === '.git')) {
        repos.push({
          path: dir,
          name: path.basename(dir),
        });
        return;
      }

      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await this.searchDirectory(path.join(dir, entry.name), repos, depth + 1);
        }
      }
    } catch (error) {
      logger.debug(`Skipping inaccessible directory ${dir}`);
    }
  }
}

module.exports = SecureGitService;
