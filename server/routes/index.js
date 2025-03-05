const express = require('express');
const projectsRoutes = require('./projects');

const router = express.Router();

// Register all route modules
router.use('/projects', projectsRoutes);

module.exports = router;
