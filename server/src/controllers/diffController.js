const GitService = require('../services/GitService');
const AnalyzerService = require('../services/AnalyzerService');
const logger = require('../utils/logger');

// Create service instances
const gitService = new GitService();
const analyzerService = new AnalyzerService();

// Load initial state
gitService.loadState().then((repoPath) => {
  if (repoPath) {
    analyzerService.setRepoPath(repoPath);
  }
}).catch((err) => {
  logger.error('Failed to load initial state:', err);
});

/**
 * Get diff between two branches
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDiff = async (req, res) => {
  try {
    const { fromBranch, toBranch } = req.body;

    if (!gitService.repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both branches must be specified' });
    }

    // Get diff between branches
    const diff = await gitService.getDiff(fromBranch, toBranch);

    res.json({
      diff,
      fromBranch,
      toBranch,
      repository: gitService.repoPath,
    });
  } catch (error) {
    logger.error('Error getting diff:', error);
    res.status(500).json({ error: 'Failed to get diff', details: error.message });
  }
};

/**
 * Analyze diff between two branches
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.analyzeDiff = async (req, res) => {
  try {
    const { fromBranch, toBranch } = req.body;

    if (!gitService.repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both branches must be specified' });
    }

    // Get diff between branches
    const diff = await gitService.getDiff(fromBranch, toBranch);

    // Analyze the diff
    const analysis = await analyzerService.analyzeDiff(diff);

    res.json({
      analysis,
      fromBranch,
      toBranch,
      repository: gitService.repoPath,
    });
  } catch (error) {
    logger.error('Error analyzing diff:', error);
    res.status(500).json({ error: 'Failed to analyze diff', details: error.message });
  }
};
