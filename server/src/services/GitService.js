const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');
const logger = require('../utils/logger');
const config = require('../config');

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
      
      if (fsSync.existsSync(this.stateFilePath)) {
        const data = await fs.readFile(this.stateFilePath, 'utf8');
        const state = JSON.parse(data);
        this.repoPath = state.repoPath || '';
        this.git = simpleGit(this.repoPath);
        logger.info('Loaded repository path:', this.repoPath);
        return this.repoPath;
      } else {
        logger.info('No state file exists yet');
        return '';
      }
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
  async findRepositories() {
    try {
      const homeDir = os.homedir();
      const commonDirs = [
        path.join(homeDir, 'Documents'),
        path.join(homeDir, 'Projects'),
        path.join(homeDir, 'Development'),
        path.join(homeDir, 'Code'),
        path.join(homeDir, 'Github')
      ];
      
      const repositories = [];
      
      for (const dir of commonDirs) {
        try {
          // Check if directory exists
          await fs.stat(dir);
          
          // Get subdirectories
          const items = await fs.readdir(dir, { withFileTypes: true });
          const subdirs = items
            .filter(item => item.isDirectory())
            .map(item => path.join(dir, item.name));
          
          // Check each subdirectory for .git folder
          for (const subdir of subdirs) {
            try {
              const gitDir = path.join(subdir, '.git');
              await fs.stat(gitDir);
              
              // It's a git repository
              const git = simpleGit(subdir);
              const isRepo = await git.checkIsRepo();
              
              if (isRepo) {
                repositories.push({
                  path: subdir,
                  name: path.basename(subdir)
                });
              }
            } catch (err) {
              // Not a git repository, continue
            }
          }
        } catch (err) {
          // Directory doesn't exist, continue
          logger.debug(`Directory doesn't exist: ${dir}`);
        }
      }
      
      return repositories;
    } catch (error) {
      logger.error('Error finding repositories:', error);
      return [];
    }
  }
}

module.exports = GitService; 