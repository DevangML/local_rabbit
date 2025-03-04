const express = require('express');

const router = express.Router();
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Store current project path
let currentProjectPath = '';

// Helper function to validate path is within allowed directories
const isPathSafe = (pathToCheck) => {
  const homeDir = os.homedir();
  const allowedDirs = [
    path.join(homeDir, 'Documents'),
    path.join(homeDir, 'Projects'),
    path.join(homeDir, 'Development'),
    path.join(homeDir, 'Code'),
    path.join(homeDir, 'Github'),
  ];

  return allowedDirs.some((dir) => pathToCheck.startsWith(dir));
};

// Safe wrapper for fs.promises.stat
const safeStat = async (pathToCheck) => {
  // Use a whitelist approach - only allow specific paths
  const homeDir = os.homedir();
  const allowedDirs = [
    path.join(homeDir, 'Documents'),
    path.join(homeDir, 'Projects'),
    path.join(homeDir, 'repos'),
    path.join(homeDir, 'git'),
    path.join(homeDir, 'code'),
    path.join(homeDir, 'src'),
    path.join(homeDir, 'workspace'),
    path.join(homeDir, 'dev'),
  ];

  const normalizedPath = path.normalize(pathToCheck);

  // Check if the path is in the whitelist
  if (!allowedDirs.some((dir) => normalizedPath.startsWith(dir))) {
    throw new Error('Path is not in allowed directories');
  }

  // Additional validation to prevent path traversal
  if (normalizedPath.includes('..')) {
    throw new Error('Path contains invalid sequences');
  }

  // Use a hardcoded path or a path from the whitelist
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.promises.stat(normalizedPath);
};

// Safe wrapper for fs.promises.readdir
const safeReaddir = async (pathToCheck, options) => {
  // Use a whitelist approach - only allow specific paths
  const homeDir = os.homedir();
  const allowedDirs = [
    path.join(homeDir, 'Documents'),
    path.join(homeDir, 'Projects'),
    path.join(homeDir, 'repos'),
    path.join(homeDir, 'git'),
    path.join(homeDir, 'code'),
    path.join(homeDir, 'src'),
    path.join(homeDir, 'workspace'),
    path.join(homeDir, 'dev'),
  ];

  const normalizedPath = path.normalize(pathToCheck);

  // Check if the path is in the whitelist
  if (!allowedDirs.some((dir) => normalizedPath.startsWith(dir))) {
    throw new Error('Path is not in allowed directories');
  }

  // Additional validation to prevent path traversal
  if (normalizedPath.includes('..')) {
    throw new Error('Path contains invalid sequences');
  }

  // Use a hardcoded path or a path from the whitelist
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.promises.readdir(normalizedPath, options);
};

// Helper function to find git repositories in common directories
const findGitRepositories = async () => {
  try {
    const homeDir = os.homedir();
    // Define a whitelist of allowed directories
    const commonDirs = [
      path.join(homeDir, 'Documents'),
      path.join(homeDir, 'Projects'),
      path.join(homeDir, 'Development'),
      path.join(homeDir, 'Code'),
      path.join(homeDir, 'Github'),
    ];

    const repositories = [];

    // Process common directories in parallel
    await Promise.all(commonDirs.map(async (dir) => {
      try {
        // Validate path before using fs operations
        if (!isPathSafe(dir)) {
          return; // Skip if path is not in allowed directories
        }

        // Check if directory exists - using safe wrapper
        const dirStat = await safeStat(dir);
        if (!dirStat.isDirectory()) {
          return; // Skip if not a directory
        }

        // Get subdirectories - using safe wrapper
        const items = await safeReaddir(dir, { withFileTypes: true });
        const subdirs = items
          .filter((item) => item.isDirectory())
          .map((item) => path.join(dir, item.name));

        // Process subdirectories in parallel
        const repoPromises = subdirs.map(async (subdir) => {
          try {
            // Validate path before using fs operations
            if (!isPathSafe(subdir)) {
              return; // Skip if path is not in allowed directories
            }

            const gitDir = path.join(subdir, '.git');
            // Use safe wrapper
            const gitDirStat = await safeStat(gitDir);
            if (!gitDirStat.isDirectory()) {
              return; // Skip if .git is not a directory
            }

            // It's a git repository
            const git = simpleGit(subdir);
            const isRepo = await git.checkIsRepo();

            if (isRepo) {
              repositories.push({
                path: subdir,
                name: path.basename(subdir),
              });
            }
          } catch (err) {
            // Not a git repository, continue
          }
        });

        // Wait for all subdirectory checks to complete
        await Promise.all(repoPromises);
      } catch (err) {
        // Directory doesn't exist, continue
      }
    }));

    return repositories;
  } catch (error) {
    console.error('Error finding repositories:', error);
    return [];
  }
};

// Get list of repositories
router.get('/api/repositories', async (req, res) => {
  try {
    const repositories = await findGitRepositories();
    res.json(repositories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set current repository
router.post('/api/repository/set', async (req, res) => {
  try {
    const { path: repoPath } = req.body;

    if (!repoPath) {
      return res.status(400).json({ error: 'Repository path is required' });
    }

    // Verify it's a git repository
    try {
      const git = simpleGit(repoPath);
      const isRepo = await git.checkIsRepo();

      if (!isRepo) {
        return res.status(400).json({ error: 'Not a valid git repository' });
      }

      // Get branches
      const branches = await git.branchLocal();
      currentProjectPath = repoPath;

      return res.json({
        path: repoPath,
        name: path.basename(repoPath),
        branches: branches.all,
        current: branches.current,
      });
    } catch (error) {
      return res.status(400).json({ error: 'Invalid repository path' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get branches for current repository
router.get('/api/repository/branches', async (req, res) => {
  try {
    if (!currentProjectPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    const git = simpleGit(currentProjectPath);
    const branches = await git.branchLocal();

    return res.json({
      repository: path.basename(currentProjectPath),
      branches: branches.all,
      current: branches.current,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get diff between branches
router.post('/api/diff', async (req, res) => {
  try {
    const { fromBranch, toBranch } = req.body;

    if (!currentProjectPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both branches must be specified' });
    }

    const git = simpleGit(currentProjectPath);
    const diff = await git.diff([fromBranch, toBranch]);

    return res.json({
      diff,
      fromBranch,
      toBranch,
      repository: path.basename(currentProjectPath),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
