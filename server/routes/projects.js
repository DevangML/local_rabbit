const express = require('express');
const router = express.Router();
const simpleGit = require('simple-git');
const path = require('path');
const { dialog } = require('electron').remote;

// Store current project path
let currentProjectPath = '';

// Get list of projects
router.get('/api/projects', async (req, res) => {
  try {
    // Return current project if exists
    if (currentProjectPath) {
      const git = simpleGit(currentProjectPath);
      const branches = await git.branchLocal();
      
      return res.json([{
        path: currentProjectPath,
        name: path.basename(currentProjectPath),
        branches: branches.all,
        current: branches.current
      }]);
    }
    
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Select project directory
router.post('/api/projects/select', async (req, res) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0];
      const git = simpleGit(selectedPath);
      
      // Verify it's a git repository
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        throw new Error('Selected directory is not a git repository');
      }

      // Get branches
      const branches = await git.branchLocal();
      currentProjectPath = selectedPath;

      res.json({
        path: selectedPath,
        name: path.basename(selectedPath),
        branches: branches.all,
        current: branches.current
      });
    } else {
      res.status(400).json({ error: 'No directory selected' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get diff between branches
router.post('/api/diff', async (req, res) => {
  try {
    const { fromBranch, toBranch } = req.body;
    
    if (!currentProjectPath) {
      throw new Error('No project selected');
    }

    const git = simpleGit(currentProjectPath);
    const diff = await git.diff([fromBranch, toBranch]);
    
    res.json({
      diff,
      fromBranch,
      toBranch,
      repository: path.basename(currentProjectPath)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
