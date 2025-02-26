const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const GitService = require('./git');
const CodeAnalyzer = require('./analyzer');

const router = express.Router();

// Store repository path and comments
let currentRepoPath = '';
const comments = new Map();

// Set repository path
router.post('/set-repo', async (req, res) => {
  try {
    const { path: repoPath } = req.body;
    
    // Validate that the path exists and is a git repository
    try {
      const stats = await fs.stat(path.join(repoPath, '.git'));
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: 'Not a valid git repository' });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Not a valid git repository' });
    }
    
    currentRepoPath = repoPath;
    return res.json({ success: true, repoPath });
  } catch (error) {
    console.error('Error setting repository path:', error);
    return res.status(500).json({ error: 'Failed to set repository path' });
  }
});

// Get repository info
router.get('/repo-info', async (req, res) => {
  try {
    if (!currentRepoPath) {
      return res.status(400).json({ error: 'Repository path not set' });
    }
    
    const gitService = new GitService(currentRepoPath);
    const branches = await gitService.getBranches();
    const currentBranch = await gitService.getCurrentBranch();
    
    return res.json({ 
      repoPath: currentRepoPath,
      branches,
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