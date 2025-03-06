const express = require('express');
const { exec } = require('child_process');

const router = express.Router();

// Simple health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.post('/branches', async (req, res) => {
  try {
    console.log('Received request for branches with body:', req.body);

    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      console.error('Error: Request body is undefined or not an object (line 15)');
      return res.status(400).json({
        error: 'Request body is undefined or invalid',
        message: 'The request body is missing, could not be parsed, or is not an object. Ensure proper Content-Type header is set.',
        line: 15,
        stack: new Error().stack
      });
    }

    console.log("request body", req.body);

    const path = req.body;

    if (!path) {
      console.error('Error: No repository path provided (line 25)');
      return res.status(400).json({
        error: 'Repository path is required',
        message: 'The "path" property must be provided in the request body.',
        line: 25,
        stack: new Error().stack
      });
    }

    console.log(`Executing git command in directory: ${path}`);

    // Execute git command to list branches
    exec('git branch', { cwd: path }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing git command: ${error}`);
        return res.status(500).json({
          error: 'Failed to fetch branches',
          details: error.message,
          command: 'git branch',
          directory: path,
          line: 38,
          stack: error.stack
        });
      }

      if (stderr) {
        console.error(`Git command stderr: ${stderr}`);
      }

      // Parse branches from git output
      const branches = stdout
        .split('\n')
        .map((branch) => branch.trim())
        .filter((branch) => branch)
        .map((branch) => branch.replace('* ', '')); // Remove the asterisk from current branch

      console.log(`Found branches: ${JSON.stringify(branches)}`);
      res.json({ branches });
    });
  } catch (error) {
    console.error('Error in /branches endpoint:', error);
    console.log("request body", req.body);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      location: '/git/branches endpoint',
      line: error.lineNumber || (new Error().stack.split('\n')[1].match(/(\d+):\d+\)/) || [])[1] || 66,
      stack: error.stack
    });
  }
});

module.exports = router;
