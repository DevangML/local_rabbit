const express = require('express');
const diffController = require('../controllers/diffController');

const router = express.Router();

/**
 * @route   GET /api/git/diff
 * @desc    Get diff between two branches
 * @access  Public
 */
router.get('/git/diff', diffController.getDiff);

/**
 * @route   POST /api/git/diff/analyze
 * @desc    Analyze diff between two branches
 * @access  Public
 */
router.post('/git/diff/analyze', diffController.analyzeDiff);

module.exports = router;
