const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const GitService = require('./git');
const CodeAnalyzer = require('./analyzer');
const { execSync } = require('child_process');
const os = require('os');

const router = express.Router();

// Store repository path and comments
let currentRepoPath = '';
const comments = new Map();

// Helper function to find git root from file paths
const findGitRootFromPaths = async (dirName, samplePaths) => {
  try {
    // Common base directories to check
    const baseDirectories = [
      process.cwd(),
      os.homedir(),
      path.join(os.homedir(), 'Documents'),
      path.join(os.homedir(), 'Projects'),
      path.join(os.homedir(), 'Desktop'),
      '/Users',
      '/home',
      '/'
    ];

    // Try to find the directory in common locations
    for (const baseDir of baseDirectories) {
      const possiblePath = path.join(baseDir, dirName);
      try {
        // Check if .git exists and it's a valid repo
        const gitPath = path.join(possiblePath, '.git');
        const stats = await fs.stat(gitPath);
        
        if (stats.isDirectory()) {
          try {
            const gitRoot = execSync('git -C "' + possiblePath + '" rev-parse --show-toplevel', {
              encoding: 'utf8'
            }).trim();
            return gitRoot;
          } catch (gitError) {
            continue;
          }
        }
      } catch (e) {
        continue;
      }
    }

    // If not found in common locations, try using mdfind (on macOS) or find
    try {
      let searchCommand;
      if (process.platform === 'darwin') {
        searchCommand = `mdfind -name "${dirName}"`;
      } else {
        searchCommand = `find / -type d -name "${dirName}" 2>/dev/null`;
      }

      const searchResults = execSync(searchCommand, { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean);

      for (const foundPath of searchResults) {
        try {
          const gitPath = path.join(foundPath, '.git');
          const stats = await fs.stat(gitPath);
          
          if (stats.isDirectory()) {
            try {
              const gitRoot = execSync('git -C "' + foundPath + '" rev-parse --show-toplevel', {
                encoding: 'utf8'
              }).trim();
              return gitRoot;
            } catch (gitError) {
              continue;
            }
          }
        } catch (e) {
          continue;
        }
      }
    } catch (e) {
      console.error('Search error:', e);
    }
  } catch (error) {
    console.error('Error finding git root:', error);
  }
  return null;
};

// Set repository path
router.post('/set-repo', async (req, res) => {
  try {
    const { name, samplePaths } = req.body;
    
    if (!name) {
      console.error('Missing name in request body');
      return res.status(400).json({ error: 'Directory name is required' });
    }

    console.log('Received directory name:', name);
    console.log('Sample paths:', samplePaths?.length || 0);

    // Try to find the git root directory
    const gitRootPath = await findGitRootFromPaths(name, samplePaths);
    if (!gitRootPath) {
      console.error('Could not find git root for directory:', name);
      return res.status(400).json({ 
        error: 'Could not locate the git repository. Please try selecting it again.',
        details: `Tried directory name: ${name}`
      });
    }
    
    console.log('Found git root:', gitRootPath);
    
    // Create a new GitService instance with the root path
    const gitService = new GitService(gitRootPath);
    
    try {
      // Try to get git status - this will throw if not a valid repo
      await gitService.git.status();
      
      // If we get here, it's a valid git repo
      currentRepoPath = gitRootPath;
      
      // Get additional repo info
      const branchData = await gitService.getBranches();
      const currentBranch = await gitService.getCurrentBranch();
      
      const response = {
        success: true,
        repoPath: gitRootPath,
        branches: branchData.all || [],
        currentBranch: currentBranch || 'main'
      };

      console.log('Sending response:', response);
      
      return res.json(response);
    } catch (gitError) {
      console.error('Git error:', gitError);
      return res.status(400).json({ 
        error: 'Not a valid git repository. Please select a directory that contains a git repository.',
        details: gitError.message
      });
    }
  } catch (error) {
    console.error('Error setting repository path:', error);
    return res.status(500).json({ 
      error: 'Failed to set repository path',
      details: error.message
    });
  }
});

// Get repository info
router.get('/repo-info', async (req, res) => {
  try {
    if (!currentRepoPath) {
      return res.status(400).json({ error: 'Repository path not set' });
    }
    
    const gitService = new GitService(currentRepoPath);
    const branchData = await gitService.getBranches();
    const currentBranch = await gitService.getCurrentBranch();
    
    return res.json({ 
      repoPath: currentRepoPath,
      branches: branchData.all || [],
      currentBranch
    });
  } catch (error) {
    console.error('Error getting repository info:', error);
    return res.status(500).json({ error: 'Failed to get repository information' });
  }
});

// Get diff between branches
router.get('/diff', async (req, res) => {
  try {
    const { fromBranch, toBranch } = req.query;
    
    if (!currentRepoPath) {
      return res.status(400).json({ error: 'Repository path not set' });
    }
    
    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both fromBranch and toBranch are required' });
    }
    
    const gitService = new GitService(currentRepoPath);
    const diffResult = await gitService.getDiff(fromBranch, toBranch);
    
    return res.json(diffResult);
  } catch (error) {
    console.error('Error getting diff:', error);
    return res.status(500).json({ error: 'Failed to get diff between branches' });
  }
});

// Run impact analysis
router.get('/analyze/impact', async (req, res) => {
  try {
    const { fromBranch, toBranch } = req.query;
    
    if (!currentRepoPath) {
      return res.status(400).json({ error: 'Repository path not set' });
    }
    
    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both fromBranch and toBranch are required' });
    }
    
    const gitService = new GitService(currentRepoPath);
    const diffResult = await gitService.getDiff(fromBranch, toBranch);
    
    const analyzer = new CodeAnalyzer(currentRepoPath);
    const analysisResult = await analyzer.analyzeImpact(diffResult, fromBranch, toBranch, gitService);
    
    return res.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing impact:', error);
    return res.status(500).json({ error: 'Failed to analyze impact' });
  }
});

// Run quality analysis
router.get('/analyze/quality', async (req, res) => {
  try {
    const { fromBranch, toBranch } = req.query;
    
    if (!currentRepoPath) {
      return res.status(400).json({ error: 'Repository path not set' });
    }
    
    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both fromBranch and toBranch are required' });
    }
    
    const gitService = new GitService(currentRepoPath);
    const diffResult = await gitService.getDiff(fromBranch, toBranch);
    
    const analyzer = new CodeAnalyzer(currentRepoPath);
    const analysisResult = await analyzer.analyzeQuality(diffResult, fromBranch, toBranch, gitService);
    
    return res.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing quality:', error);
    return res.status(500).json({ error: 'Failed to analyze code quality' });
  }
});

// Run generic review
router.get('/analyze/review', async (req, res) => {
  try {
    const { fromBranch, toBranch } = req.query;
    
    if (!currentRepoPath) {
      return res.status(400).json({ error: 'Repository path not set' });
    }
    
    if (!fromBranch || !toBranch) {
      return res.status(400).json({ error: 'Both fromBranch and toBranch are required' });
    }
    
    const gitService = new GitService(currentRepoPath);
    const diffResult = await gitService.getDiff(fromBranch, toBranch);
    
    const analyzer = new CodeAnalyzer(currentRepoPath);
    const reviewResult = await analyzer.genericReview(diffResult, fromBranch, toBranch, gitService);
    
    return res.json(reviewResult);
  } catch (error) {
    console.error('Error running generic review:', error);
    return res.status(500).json({ error: 'Failed to run code review' });
  }
});

// Get comments for a file
router.get('/comments/:fileId', (req, res) => {
  const { fileId } = req.params;
  const fileComments = comments.get(fileId) || [];
  return res.json(fileComments);
});

// Add a comment
router.post('/comments/:fileId', (req, res) => {
  try {
    const { fileId } = req.params;
    const { line, content, type = 'comment' } = req.body;
    
    if (!line || !content) {
      return res.status(400).json({ error: 'Both line and content are required' });
    }
    
    const fileComments = comments.get(fileId) || [];
    const newComment = {
      id: Date.now().toString(),
      line,
      content,
      type,
      createdAt: new Date().toISOString()
    };
    
    fileComments.push(newComment);
    comments.set(fileId, fileComments);
    
    return res.json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete a comment
router.delete('/comments/:fileId/:commentId', (req, res) => {
  try {
    const { fileId, commentId } = req.params;
    
    const fileComments = comments.get(fileId) || [];
    const updatedComments = fileComments.filter(comment => comment.id !== commentId);
    
    comments.set(fileId, updatedComments);
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;