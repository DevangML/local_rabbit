const express = require('express');
const repositoryRoutes = require('./repositoryRoutes');
const diffRoutes = require('./diffRoutes');

const router = express.Router();

// Register routes
router.use('/api', repositoryRoutes);
router.use('/api', diffRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router; 