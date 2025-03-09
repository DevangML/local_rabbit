const express = require('express');
const router = express.Router();

// Import other routes
const repositoryRoutes = require('./repositoryRoutes');
const diffRoutes = require('./diffRoutes');
const serverActionsRoutes = require('./serverActionsRoutes');

// Use routes
router.use('/api/repository', repositoryRoutes);
router.use('/api/diff', diffRoutes);
router.use('/api/actions', serverActionsRoutes);

// Basic health check endpoint
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
