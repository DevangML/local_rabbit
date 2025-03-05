const express = require('express');
const path = require('path');
const SecureGitService = require('../src/services/SecureGitService');

const router = express.Router();
const gitService = new SecureGitService();

/**
 * Get list of Git repositories
 * This endpoint finds Git repositories in common directories
 */
router.get('/repositories', async (req, res) => {
  try {
    const repositories = await SecureGitService.findRepositories();
    res.json(repositories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// For backward compatibility - direct API route
router.get('/api/repositories', async (req, res) => {
  try {
    const repositories = await SecureGitService.findRepositories();
    res.json(repositories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Set current repository
 * This endpoint sets the current repository path for Git operations
 * It only stores the path and doesn't access or store any project files
 */
router.post('/repository/set', async (req, res) => {
  try {
    const { path: repoPath } = req.body;

    if (!repoPath) {
      return res.status(400).json({ error: 'Repository path is required' });
    }

    // Verify it's a git repository
    const isValidRepo = await gitService.isValidRepo(repoPath);
    if (!isValidRepo) {
      return res.status(400).json({ error: 'Not a valid git repository' });
    }

    // Set the repository path
    const isSet = gitService.setRepositoryPath(repoPath);
    if (!isSet) {
      return res.status(400).json({ error: 'Invalid repository path' });
    }

    // Get branches
    const branches = await gitService.getBranches();

    return res.json({
      path: repoPath,
      name: path.basename(repoPath),
      branches: branches.all,
      current: branches.current,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// For backward compatibility - direct API route
router.post('/api/repository/set', async (req, res) => {
  try {
    const { path: repoPath } = req.body;

    if (!repoPath) {
      return res.status(400).json({ error: 'Repository path is required' });
    }

    // Verify it's a git repository
    const isValidRepo = await gitService.isValidRepo(repoPath);
    if (!isValidRepo) {
      return res.status(400).json({ error: 'Not a valid git repository' });
    }

    // Set the repository path
    const isSet = gitService.setRepositoryPath(repoPath);
    if (!isSet) {
      return res.status(400).json({ error: 'Invalid repository path' });
    }

    // Get branches
    const branches = await gitService.getBranches();

    return res.json({
      path: repoPath,
      name: path.basename(repoPath),
      branches: branches.all,
      current: branches.current,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Get branches for current repository
 * This endpoint gets the branches for the current repository
 * It only uses the path and doesn't access or store any project files
 */
router.get('/repository/branches', async (req, res) => {
  try {
    const repoPath = gitService.getRepositoryPath();
    if (!repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    const branches = await gitService.getBranches();

    return res.json({
      repository: path.basename(repoPath),
      branches: branches.all,
      current: branches.current,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// For backward compatibility - direct API route
router.get('/api/repository/branches', async (req, res) => {
  try {
    const repoPath = gitService.getRepositoryPath();
    if (!repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    const branches = await gitService.getBranches();

    return res.json({
      repository: path.basename(repoPath),
      branches: branches.all,
      current: branches.current,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Get diff between branches
 * This endpoint gets the diff between two branches
 * It only uses Git commands and doesn't access or store any project files
 */
router.post('/diff', async (req, res) => {
  try {
    const { fromBranch, toBranch } = req.body;
    const repoPath = gitService.getRepositoryPath();

    if (!repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both branches must be specified' });
    }

    const diff = await gitService.getDiff(fromBranch, toBranch);

    return res.json({
      diff,
      fromBranch,
      toBranch,
      repository: path.basename(repoPath),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// For backward compatibility - direct API route
router.post('/api/diff', async (req, res) => {
  try {
    const { fromBranch, toBranch } = req.body;
    const repoPath = gitService.getRepositoryPath();

    if (!repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both branches must be specified' });
    }

    const diff = await gitService.getDiff(fromBranch, toBranch);

    return res.json({
      diff,
      fromBranch,
      toBranch,
      repository: path.basename(repoPath),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
