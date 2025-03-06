const path = require('path');
const _os = require('os');
const GitService = require('../services/GitService');
const logger = require('../utils/logger');
const _fs = require('fs');
const { exec: _exec } = require('child_process');
const { homedir } = require('os');

// Create a GitService instance
const gitService = new GitService();

// Load initial state
gitService.loadState().catch((err) => {
  logger.error('Failed to load initial state:', err);
  throw err; // Re-throw to satisfy promise/always-return
});

/**
 * Expand tilde in paths (e.g., "~/Documents" becomes "/Users/username/Documents")
 * @param {string} filePath - Path that may contain tilde
 * @returns {string} - Path with tilde expanded
 */
const _expandTilde = (filePath) => {
  if (filePath.startsWith('~/')) {
    return path.join(homedir(), filePath.slice(2));
  }
  return filePath;
};

/**
 * Get list of repositories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRepositories = async (req, res) => {
  try {
    const repositories = await GitService.findRepositories();
    res.json(repositories);
  } catch (error) {
    logger.error('Error getting repositories:', error);
    res.status(500).json({ error: 'Failed to get repositories' });
  }
};

/**
 * Set repository
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.setRepository = async (req, res) => {
  const { path: repoPath } = req.body;

  if (!repoPath) {
    return res.status(400).json({ error: 'Repository path is required' });
  }

  try {
    const isValid = await gitService.isValidRepo(repoPath);
    if (!isValid) {
      return res.status(400).json({ error: 'Not a valid git repository' });
    }

    gitService.setRepoPath(repoPath);
    const branches = await gitService.getBranches();
    const current = await gitService.getCurrentBranch();

    await gitService.saveState();

    res.json({
      path: repoPath,
      branches: branches.all,
      current,
    });
  } catch (error) {
    logger.error('Error setting repository:', error);
    res.status(500).json({ error: 'Failed to set repository' });
  }
};

/**
 * Get branches for current repository
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBranches = async (req, res) => {
  if (!gitService.repoPath) {
    return res.status(400).json({ error: 'No repository selected' });
  }

  try {
    const branches = await gitService.getBranches();
    const current = await gitService.getCurrentBranch();

    res.json({
      branches: branches.all,
      current,
    });
  } catch (error) {
    logger.error('Error getting branches:', error);
    res.status(500).json({ error: 'Failed to get branches' });
  }
};

/**
 * Get current repository info
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRepositoryInfo = async (req, res) => {
  try {
    if (!gitService.repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    const branches = await gitService.getBranches();
    const currentBranch = await gitService.getCurrentBranch();

    return res.json({
      path: gitService.repoPath,
      name: path.basename(gitService.repoPath),
      branches: branches.all || [],
      current: currentBranch,
    });
  } catch (error) {
    logger.error('Error getting repository info:', error);
    return res.status(500).json({ error: 'Failed to get repository info', details: error.message });
  }
};
