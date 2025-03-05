const express = require('express');
const secureGitRoutes = require('./secureGitRoutes.js');

const router = express.Router();

// Register all route modules
router.use('/git', secureGitRoutes);

module.exports = router;
