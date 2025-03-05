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
  return repoPath; // Return a value to satisfy promise/always-return
}).catch((err) => {
  logger.error('Failed to load initial state:', err);
  throw err; // Re-throw to satisfy promise/always-return
});

/**
 * Get diff between two branches
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDiff = async (req, res) => {
  try {
    const { from: fromBranch, to: toBranch } = req.query;

    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both from and to branches are required' });
    }

    if (!gitService.repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    const diff = await gitService.getDiff(fromBranch, toBranch);

    // Parse the diff output into a structured format
    const files = [];
    let currentFile = null;
    let currentContent = [];

    diff.split('\n').forEach(line => {
      if (line.startsWith('diff --git')) {
        if (currentFile) {
          currentFile.content = currentContent.join('\n');
          files.push(currentFile);
        }
        const filePath = line.split(' b/')[1];
        currentFile = { path: filePath, content: '' };
        currentContent = [];
      } else if (currentFile) {
        currentContent.push(line);
      }
    });

    // Add the last file
    if (currentFile) {
      currentFile.content = currentContent.join('\n');
      files.push(currentFile);
    }

    // Set cache control headers to prevent 304s
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return res.json({
      files,
      fromBranch,
      toBranch,
      repository: gitService.repoPath
    });
  } catch (error) {
    logger.error('Error getting diff:', error);
    return res.status(500).json({ error: 'Failed to get diff' });
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

    return res.json({
      analysis,
      fromBranch,
      toBranch,
      repository: gitService.repoPath,
    });
  } catch (error) {
    logger.error('Error analyzing diff:', error);
    return res.status(500).json({ error: 'Failed to analyze diff', details: error.message });
  }
};
