const express = require('express');
const path = require('path');
const { exec } = require('child_process');
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

    console.log('Received request to set repository path:', repoPath);

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

    console.log('Received request to set repository path:', repoPath);

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

/**
 * Get branches for a specific repository path
 * Direct POST method to fetch branches from any repository path
 */
router.post('/branches', async (req, res) => {
  try {
    const { path: repoPath } = req.body;

    if (!repoPath) {
      return res.status(400).json({ error: 'Repository path is required' });
    }

    console.log(`Received request to get branches for: ${repoPath}`);

    // Verify it's a git repository
    const isValidRepo = await gitService.isValidRepo(repoPath);
    if (!isValidRepo) {
      return res.status(400).json({ error: 'Not a valid git repository' });
    }

    // Set the repository path temporarily
    const tempGitService = new SecureGitService();
    tempGitService.setRepositoryPath(repoPath);

    // Get branches
    const branches = await tempGitService.getBranches();

    return res.json({
      branches: branches.all,
      current: branches.current,
    });
  } catch (error) {
    console.error(`Error fetching branches: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Get diff between branches (using query parameters)
 * This endpoint gets the diff between two branches using query parameters
 */
router.get('/diff', async (req, res) => {
  try {
    const { from, to } = req.query;
    const repoPath = gitService.getRepositoryPath();

    console.log(`Diff request received - from: ${from}, to: ${to}, repoPath: ${repoPath}`);

    if (!repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    if (!from || !to) {
      return res.status(400).json({ error: 'Both branches must be specified using from and to parameters' });
    }

    console.log(`Getting diff between branches ${from} and ${to}`);

    // Get the list of changed files first
    const changedFiles = await gitService.getDiff(from, to);
    console.log(`Found ${changedFiles.length} changed files`);

    // For each file, get the actual diff content
    const detailedDiff = await Promise.all(
      changedFiles.map(async (change) => {
        try {
          console.log(`Getting diff for file: ${change.file}`);
          // Get the diff content for this specific file
          const command = `git diff ${from}..${to} -- "${change.file}"`;
          console.log(`Running command: ${command}`);

          const diffContent = await new Promise((resolve, reject) => {
            exec(command, { cwd: repoPath }, (error, stdout, _stderr) => {
              if (error) {
                console.error(`Error getting diff content for ${change.file}:`, error);
                return reject(error);
              }
              if (!stdout.trim()) {
                console.warn(`Empty diff content for ${change.file}`);
              }
              resolve(stdout);
            });
          });

          console.log(`Got diff content for ${change.file}: ${diffContent.substring(0, 100)}...`);

          return {
            ...change,
            diffContent,
          };
        } catch (fileError) {
          console.error(`Error processing file ${change.file}:`, fileError);
          return {
            ...change,
            diffContent: '',
            error: fileError.message,
          };
        }
      }),
    );

    // Filter out files with no diff content
    const filteredDiff = detailedDiff.filter((item) => item.diffContent.trim());
    console.log(`Returning ${filteredDiff.length} files with diff content`);

    return res.json({
      diff: filteredDiff,
      fromBranch: from,
      toBranch: to,
      repository: path.basename(repoPath),
    });
  } catch (error) {
    console.error('Error in GET /diff endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * AI Analysis of diff between branches
 * This endpoint provides AI analysis of changes between branches
 */
router.post('/analyze', async (req, res) => {
  try {
    const {
      fromBranch, toBranch, prompt, repoPath,
    } = req.body;

    // If repoPath is provided, set it; otherwise use the current one
    if (repoPath) {
      const isValidRepo = await gitService.isValidRepo(repoPath);
      if (!isValidRepo) {
        return res.status(400).json({ error: 'Not a valid git repository' });
      }
      gitService.setRepositoryPath(repoPath);
    }

    const currentRepoPath = gitService.getRepositoryPath();
    if (!currentRepoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both branches must be specified' });
    }

    console.log(`Analyzing diff between ${fromBranch} and ${toBranch} with prompt: ${prompt || 'default'}`);

    // Get the list of changed files first
    const changedFiles = await gitService.getDiff(fromBranch, toBranch);

    // For demo purposes, we're creating a mock analysis result
    // In a real implementation, this would call an AI service with the diff data

    // Get detailed diff for analysis
    const detailedDiff = await Promise.all(
      changedFiles.slice(0, 5).map(async (change) => {
        try {
          const command = `git diff ${fromBranch}..${toBranch} -- "${change.file}"`;
          const diffContent = await new Promise((resolve, reject) => {
            exec(command, { cwd: currentRepoPath }, (error, stdout, _stderr) => {
              if (error) {
                console.error(`Error getting diff content for ${change.file}:`, error);
                return reject(error);
              }
              resolve(stdout);
            });
          });

          return {
            ...change,
            diffContent,
          };
        } catch (fileError) {
          console.error(`Error processing file ${change.file}:`, fileError);
          return {
            ...change,
            diffContent: '',
            error: fileError.message,
          };
        }
      }),
    );

    // Generate mock analysis
    const analysis = {
      summary: `This change set includes modifications to ${changedFiles.length} files. 
        The main changes focus on ${prompt || 'functionality improvements and bug fixes'}.`,
      suggestions: [
        'Consider adding more unit tests for the changed components',
        'Documentation should be updated to reflect the new changes',
        'Some variable names could be more descriptive for better maintainability',
      ],
      codeQuality: {
        Maintainability: 'The changes generally improve code maintainability through better structure and organization.',
        Performance: 'No significant performance impact detected in the changes.',
        Security: 'No security issues identified in the code changes.',
      },
      fileAnalysis: detailedDiff.map((file) => ({
        file: file.file,
        status: file.status,
        analysis: `The changes to ${file.file} appear to ${file.status === 'A' ? 'add new functionality for'
          : file.status === 'M' ? 'modify existing behavior of'
            : file.status === 'D' ? 'remove' : 'change'
          } the component.`,
      })),
    };

    return res.json(analysis);
  } catch (error) {
    console.error('Error in /analyze endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
