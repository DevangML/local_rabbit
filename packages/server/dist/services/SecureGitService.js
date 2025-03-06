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

  isPathAllowed(pathToCheck) {
    return this.allowedDirectories.some((dir) => pathToCheck.startsWith(dir) && !pathToCheck.includes('..'));
  }

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
      exec('git branch', { cwd: this.currentRepoPath }, (error, stdout, _stderr) => {
        if (error) {
          logger.error(`Error getting branches: ${error.message}`);
          return reject(error);
        }

        const all = stdout
          .split('\n')
          .map((branch) => branch.trim())
          .filter((branch) => branch)
          .map((branch) => branch.replace('* ', '')); // Remove the asterisk from current branch

        const current = stdout
          .split('\n')
          .find((branch) => branch.trim().startsWith('* '));

        const currentBranch = current ? current.replace('* ', '').trim() : '';

        resolve({
          all,
          current: currentBranch,
        });
      });
    });
  }

  async getDiff(fromBranch, toBranch) {
    if (!this.currentRepoPath) {
      throw new Error('No repository selected');
    }

    if (!fromBranch || !toBranch) {
      throw new Error('Both branches must be specified');
    }

    return new Promise((resolve, reject) => {
      const cmd = `git diff --name-status ${fromBranch}..${toBranch}`;
      exec(cmd, { cwd: this.currentRepoPath }, (error, stdout, _stderr) => {
        if (error) {
          logger.error(`Error getting diff: ${error.message}`);
          return reject(error);
        }

        const changes = stdout
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => {
            const [status, file] = line.split('\t');
            return { status, file };
          });

        resolve(changes);
      });
    });
  }

  static async findRepositories() {
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

  static async searchDirectory(dir, repos, depth = 0) {
    if (depth > 3) return;

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      if (entries.some((entry) => entry.name === '.git')) {
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
