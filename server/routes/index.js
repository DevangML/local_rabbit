const express = require('express');
const secureGitRoutes = require('./secureGitRoutes.js');
const gitRoutes = require('./git.js');
const codeReviewRoutes = require('./codeReviewRoutes.js');

const router = express.Router();

// Register all route modules
router.use('/git', secureGitRoutes); // For secure Git operations
router.use('/git', gitRoutes); // For Git branch listing
router.use('/code-review', codeReviewRoutes); // For AI code review

module.exports = router;
