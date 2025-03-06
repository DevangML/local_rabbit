const express = require('express');
const repositoryRoutes = require('./repositoryRoutes');
const diffRoutes = require('./diffRoutes');
const codeReviewRoutes = require('../../routes/codeReviewRoutes');
const router = express.Router();
// Register routes
router.use('/api', repositoryRoutes);
router.use('/api', diffRoutes);
router.use('/api/code-review', codeReviewRoutes);
// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
module.exports = router;
export {};
