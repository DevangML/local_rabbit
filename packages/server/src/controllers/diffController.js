const GitService = require('../services/GitService');
const AnalyzerService = require('../services/AnalyzerService');
const logger = require('../utils/logger');

// Create service instances
const gitService = new GitService();
const analyzerService = new AnalyzerService();

// Load initial state
gitService.loadState().then((/** @type {string|null} */ repoPath) => {
  if (repoPath) {
    analyzerService.setRepoPath(repoPath);
  }
  return repoPath;
}).catch((/** @type {unknown} */ err) => {
  logger.error('Failed to load initial state:', err);
  throw err;
});

/**
 * @typedef {Object} DiffFile
 * @property {string} path
 * @property {string} content
 */

/**
 * Get diff between two branches
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.getDiff = async (req, res) => {
  try {
    const fromBranch = String(req.query.from);
    const toBranch = String(req.query.to);

    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both from and to branches are required' });
    }

    if (!gitService.repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    const diff = await gitService.getDiff(fromBranch, toBranch);

    /** @type {DiffFile[]} */
    const files = [];
    /** @type {DiffFile | null} */
    let currentFile = null;
    /** @type {string[]} */
    let currentContent = [];

    diff.split('\n').forEach((/** @type {string} */ line) => {
      if (line.startsWith('diff --git')) {
        if (currentFile) {
          /** @type {DiffFile} */ (currentFile).content = currentContent.join('\n');
          files.push(currentFile);
        }
        const filePath = line.split(' b/')[1];
        if (filePath) {
          currentFile = { path: filePath, content: '' };
          currentContent = [];
        }
      } else if (currentFile) {
        currentContent.push(line);
      }
    });

    if (currentFile) {
      /** @type {DiffFile} */ (currentFile).content = currentContent.join('\n');
      files.push(currentFile);
    }

    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });

    return res.json({
      files,
      fromBranch,
      toBranch,
      repository: gitService.repoPath,
    });
  } catch (error) {
    logger.error('Error getting diff:', error);
    return res.status(500).json({ error: 'Failed to get diff' });
  }
};

/**
 * Analyze diff between two branches
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.analyzeDiff = async (req, res) => {
  try {
    const { fromBranch, toBranch, prompt } = /** @type {Record<string, string>} */ (req.body);

    if (!gitService.repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both branches must be specified' });
    }

    const diff = await gitService.getDiff(fromBranch, toBranch);
    const analysis = await analyzerService.analyzeDiff(diff, prompt);

    return res.json({
      analysis,
      fromBranch,
      toBranch,
      repository: gitService.repoPath,
    });
    // @ts-ignore
  } catch (/** @type {Error} */ error) {
    logger.error('Error analyzing diff:', error);
    return res.status(500).json({
      error: 'Failed to analyze diff',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
