const path = require('path');
const os = require('os');
const fs = require('fs').promises;
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
