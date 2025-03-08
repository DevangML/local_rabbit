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
 * @typedef {Object} GitBranches
 * @property {string[]} all - All branches
 */

/**
 * @typedef {Object} GitServiceResult
 * @property {string[]} [all]
 */

/**
 * Expand tilde in paths (e.g., "~/Documents" becomes "/Users/username/Documents")
 * @param {string} filePath - Path that may contain tilde
 * @returns {string} - Path with tilde expanded
 */
const _expandTilde = (filePath) => {
  if (filePath && filePath.startsWith('~/')) {
    return path.join(homedir(), filePath.slice(2));
  }
  return filePath;
};

/**
 * Get list of repositories
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
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
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response | void>} Express response
 */
exports.setRepository = async (req, res) => {
  const { path: repoPath } = /** @type {Record<string, string>} */ (req.body);

  if (!repoPath) {
    return res.status(400).json({ error: 'Repository path is required' });
  }

  try {
    // First set the repo path, then check if it's valid
    const expandedPath = _expandTilde(repoPath);
    gitService.setRepoPath(expandedPath);
    const isValid = await gitService.isValidRepo();

    if (!isValid) {
      return res.status(400).json({ error: 'Not a valid git repository' });
    }

    // Repository is already set above, no need to set it again
    /** @type {GitServiceResult} */
    const branchesResult = await gitService.getBranches();
    const branches = { all: branchesResult.all || [] };
    const current = await gitService.getCurrentBranch();

    await gitService.saveState();

    return res.status(200).json({ success: true, data: { path: expandedPath, branches: branches.all, current } });
  } catch (error) {
    logger.error('Error setting repository:', error);
    return res.status(500).json({ error: 'Failed to set repository', message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

/**
 * Get branches
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response | void>} Express response
 */
exports.getBranches = async (req, res) => {
  try {
    if (!gitService.repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    /** @type {GitServiceResult} */
    const branches = await gitService.getBranches();
    const current = await gitService.getCurrentBranch();

    return res.status(200).json({ success: true, data: { branches: branches.all || [], current } });
  } catch (error) {
    logger.error('Error getting branches:', error);
    return res.status(500).json({ error: 'Failed to get branches', message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

/**
 * Get current repository info
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.getRepositoryInfo = async (req, res) => {
  try {
    if (!gitService.repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    /** @type {GitServiceResult} */
    const branches = await gitService.getBranches();
    const currentBranch = await gitService.getCurrentBranch();

    return res.json({
      path: gitService.repoPath,
      name: path.basename(gitService.repoPath),
      branches: branches.all || [],
      current: currentBranch,
    });
  } catch (/** @type {unknown} */ error) {
    logger.error('Error getting repository info:', error);
    return res.status(500).json({
      error: 'Failed to get repository info',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
