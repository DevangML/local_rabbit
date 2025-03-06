const express = require('express');
const CodeReviewService = require('../src/services/CodeReviewService');
const SecureGitService = require('../src/services/SecureGitService');
const logger = require('../src/utils/logger');
const axios = require('axios');

const router = express.Router();
const codeReviewService = new CodeReviewService();
const secureGitService = new SecureGitService();

/**
 * Get all repositories
 * Endpoint for listing available repositories
 */
router.get('/repositories', async (req, res) => {
  try {
    const repositories = await SecureGitService.findRepositories();
    res.json(repositories);
  } catch (error) {
    logger.error('Error fetching repositories:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Select repository
 * Endpoint for setting the current repository
 */
router.post('/select-repository', async (req, res) => {
  try {
    // Debug request details
    console.log('[DEBUG] select-repository request headers:', req.headers);
    console.log('[DEBUG] select-repository request body:', req.body);

    // Get repository path from multiple possible sources
    let repoPath;

    // 1. Try from JSON body
    if (req.body && req.body.path) {
      repoPath = req.body.path;
    }
    // 2. Try from query parameters
    else if (req.query && req.query.path) {
      repoPath = req.query.path;
    }
    // 3. Try from URL-encoded form data
    else if (req.body && typeof req.body === 'string') {
      try {
        // Try to parse as JSON
        const parsedBody = JSON.parse(req.body);
        if (parsedBody.path) {
          repoPath = parsedBody.path;
        }
      } catch (e) {
        // Not valid JSON, might be URL-encoded
        const params = new URLSearchParams(req.body);
        if (params.has('path')) {
          repoPath = params.get('path');
        }
      }
    }

    if (!repoPath) {
      logger.error('Repository path not found in request');
      return res.status(400).json({
        error: 'Repository path is required',
        receivedBody: req.body,
        contentType: req.headers['content-type']
      });
    }

    logger.info(`Setting repository path to: ${repoPath}`);
    const isPathSet = secureGitService.setRepositoryPath(repoPath);

    if (!isPathSet) {
      return res.status(403).json({ error: 'Access to this repository path is not allowed' });
    }

    const isValid = await secureGitService.isValidRepo(repoPath);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Git repository' });
    }

    res.json({ success: true, path: repoPath });
  } catch (error) {
    logger.error('Error selecting repository:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Select repository (GET method)
 * Alternative endpoint for setting the current repository via query parameters
 */
router.get('/select-repository', async (req, res) => {
  try {
    // Debug request details
    console.log('[DEBUG] GET select-repository request:', { query: req.query });

    const repoPath = req.query.path;

    if (!repoPath) {
      return res.status(400).json({ error: 'Repository path is required' });
    }

    logger.info(`Setting repository path to: ${repoPath} (via GET)`);
    const isPathSet = secureGitService.setRepositoryPath(repoPath);

    if (!isPathSet) {
      return res.status(403).json({ error: 'Access to this repository path is not allowed' });
    }

    const isValid = await secureGitService.isValidRepo(repoPath);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid Git repository' });
    }

    res.json({ success: true, path: repoPath });
  } catch (error) {
    logger.error('Error selecting repository (GET):', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get branches
 * Endpoint for listing branches in the selected repository
 */
router.get('/branches', async (req, res) => {
  try {
    // Try to get repo path from query param first
    let repoPath = req.query.path;

    // If not provided in query, use the one stored in service
    if (!repoPath) {
      repoPath = secureGitService.getRepositoryPath();
    } else {
      // If path was provided directly, we need to set it
      const isPathSet = secureGitService.setRepositoryPath(repoPath);
      if (!isPathSet) {
        return res.status(403).json({ error: 'Access to this repository path is not allowed' });
      }
    }

    if (!repoPath) {
      return res.status(400).json({ error: 'No repository selected. Please select a repository first.' });
    }

    logger.info(`Getting branches for repository: ${repoPath}`);
    const branches = await secureGitService.getBranches();
    res.json(branches);
  } catch (error) {
    logger.error('Error fetching branches:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Review pull request
 * Endpoint for analyzing code differences between branches
 */
router.post('/analyze', async (req, res) => {
  try {
    const { baseBranch, headBranch, fromBranch, toBranch, repoPath } = req.body;

    // Support both naming conventions (from old and new components)
    const actualBaseBranch = baseBranch || fromBranch;
    const actualHeadBranch = headBranch || toBranch;

    // Get the repository path - first from request, then from service
    let actualRepoPath = repoPath;
    if (!actualRepoPath) {
      actualRepoPath = secureGitService.getRepositoryPath();
    } else {
      // If repo path was provided directly, try to set it
      const isPathSet = secureGitService.setRepositoryPath(actualRepoPath);
      if (!isPathSet) {
        return res.status(403).json({ error: 'Access to this repository path is not allowed' });
      }
    }

    if (!actualRepoPath) {
      return res.status(400).json({ error: 'No repository selected. Please select a repository first.' });
    }

    if (!actualBaseBranch || !actualHeadBranch) {
      return res.status(400).json({ error: 'Base and head branches are required' });
    }

    // Log the analysis request
    logger.info(`Starting code review for ${actualHeadBranch} against ${actualBaseBranch} in ${actualRepoPath}`);

    // Set a longer timeout for complex reviews
    req.setTimeout(300000); // 5 minutes

    // Perform the code review with token optimization
    const reviewResults = await codeReviewService.reviewPullRequest(actualRepoPath, actualBaseBranch, actualHeadBranch);

    res.json(reviewResults);
  } catch (error) {
    logger.error('Error analyzing code:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get diff between branches
 * Endpoint for getting the raw diff between two branches
 */
router.get('/diff', async (req, res) => {
  try {
    const { baseBranch, headBranch } = req.query;
    const repoPath = secureGitService.getRepositoryPath();

    if (!repoPath) {
      return res.status(400).json({ error: 'No repository selected' });
    }

    if (!baseBranch || !headBranch) {
      return res.status(400).json({ error: 'Base and head branches are required' });
    }

    const diffOutput = await codeReviewService.getDiffBetweenBranches(repoPath, baseBranch, headBranch);
    const files = await codeReviewService.parseGitDiff(diffOutput);

    res.json({ files });
  } catch (error) {
    logger.error('Error getting diff:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get review status
 * Endpoint for checking the status of ongoing analyses
 */
router.get('/status', (req, res) => {
  // This could be extended to support progress tracking for long-running analyses
  res.json({ status: 'ready' });
});

/**
 * Debug endpoint to check Gemini API key status
 * FOR DEVELOPMENT USE ONLY - Remove in production
 */
router.get('/debug-api-key', (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return res.json({
        status: 'error',
        message: 'Gemini API key is missing',
        exists: false
      });
    }

    const keyLength = key.length;
    const firstChars = key.substring(0, 4);
    const lastChars = key.substring(keyLength - 4);
    const isValidFormat = key.startsWith('AIza');

    res.json({
      status: 'success',
      message: 'Gemini API key found',
      exists: true,
      length: keyLength,
      preview: `${firstChars}...${lastChars}`,
      validFormat: isValidFormat,
      environmentVariables: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT
      }
    });
  } catch (error) {
    logger.error('Error in debug endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Direct test for the Gemini API key
 * FOR DEVELOPMENT USE ONLY - Remove in production
 */
router.get('/test-gemini-key', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: 'API key is missing',
        envVars: Object.keys(process.env).filter(key => !key.includes('SECRET')).join(', ')
      });
    }

    // Send a simple request to Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: "Hello, this is a test request. Please respond with 'API key is valid'." }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100
      }
    };

    // Log request details for debugging
    logger.info(`Testing Gemini API with key starting with ${apiKey.substring(0, 4)}...`);

    const response = await axios.post(url, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Return success with the API response
    return res.json({
      success: true,
      message: 'API key is valid',
      apiResponse: response.data
    });
  } catch (error) {
    // Log full error for debugging
    logger.error('Error testing Gemini API key:', error);

    // Return detailed error information
    return res.status(500).json({
      error: 'Failed to validate API key',
      message: error.message,
      responseData: error.response?.data || null,
      statusCode: error.response?.status || null
    });
  }
});

/**
 * Dump environment variables (excluding sensitive ones)
 * FOR DEVELOPMENT USE ONLY - Remove in production
 */
router.get('/dump-env', (req, res) => {
  try {
    // Create a safe copy of process.env
    const safeEnv = {};

    for (const [key, value] of Object.entries(process.env)) {
      // Skip sensitive keys
      if (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('TOKEN')) {
        safeEnv[key] = '[REDACTED]';
      } else if (key.includes('KEY')) {
        // For API keys, show only partial values
        const valueLength = value.length;
        if (valueLength > 8) {
          safeEnv[key] = `${value.substring(0, 4)}...${value.substring(valueLength - 4)}`;
        } else {
          safeEnv[key] = '[REDACTED SHORT KEY]';
        }
      } else {
        safeEnv[key] = value;
      }
    }

    res.json({
      message: 'Environment variables (sensitive data redacted)',
      env: safeEnv,
      nodeVersion: process.version,
      platform: process.platform
    });
  } catch (error) {
    logger.error('Error dumping environment:', error);
    res.status(500).json({ error: 'Failed to dump environment variables' });
  }
});

module.exports = router;
