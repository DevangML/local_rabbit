const express = require('express');
const projectsRoutes = require('./projects.js');

const router = express.Router();

// Register all route modules
router.use('/projects', projectsRoutes);

module.exports = router;
