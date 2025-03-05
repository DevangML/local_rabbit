const path = require('path');
const GitService = require('../services/GitService');
const logger = require('../utils/logger');

// Create a GitService instance
const gitService = new GitService();

// Load initial state
gitService.loadState().catch(err => {
  logger.error('Failed to load initial state:', err);
});

/**
 * Get list of repositories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRepositories = async (req, res) => {
  try {
    const repositories = await gitService.findRepositories();
    res.json(repositories);
  } catch (error) {
    logger.error('Error getting repositories:', error);
    res.status(500).json({ error: 'Failed to get repositories', details: error.message });
  }
};

/**
 * Set current repository
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.setRepository = async (req, res) => {
  try {
    const { path: repoPath } = req.body;
    
    if (!repoPath) {
      return res.status(400).json({ error: 'Repository path is required' });
    }
    
    // Set repository path
    gitService.setRepoPath(repoPath);
    
    // Verify it's a git repository
    const isRepo = await gitService.isValidRepo();
    if (!isRepo) {
      return res.status(400).json({ error: 'Not a valid git repository' });
    }
    
    // Get branches
    const branches = await gitService.getBranches();
    const currentBranch = await gitService.getCurrentBranch();
    
    // Save state
    await gitService.saveState();
    
    res.json({
      path: repoPath,
      name: path.basename(repoPath),
      branches: branches.all || [],
      current: currentBranch
    });
  } catch (error) {
    logger.error('Error setting repository:', error);
    res.status(500).json({ error: 'Failed to set repository', details: error.message });
  }
};

/**
 * Get branches for current repository
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBranches = async (req, res) => {
  try {
    if (!gitService.repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }
    
    const branches = await gitService.getBranches();
    const currentBranch = await gitService.getCurrentBranch();
    
    res.json({
      repository: path.basename(gitService.repoPath),
      branches: branches.all || [],
      current: currentBranch
    });
  } catch (error) {
    logger.error('Error getting branches:', error);
    res.status(500).json({ error: 'Failed to get branches', details: error.message });
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
    
    res.json({
      path: gitService.repoPath,
      name: path.basename(gitService.repoPath),
      branches: branches.all || [],
      current: currentBranch
    });
  } catch (error) {
    logger.error('Error getting repository info:', error);
    res.status(500).json({ error: 'Failed to get repository info', details: error.message });
  }
}; 