const express = require('express');
const diffController = require('../controllers/diffController');

const router = express.Router();

/**
 * @route   POST /api/diff
 * @desc    Get diff between two branches
 * @access  Public
 */
router.post('/diff', diffController.getDiff);

/**
 * @route   POST /api/diff/analyze
 * @desc    Analyze diff between two branches
 * @access  Public
 */
router.post('/diff/analyze', diffController.analyzeDiff);

module.exports = router;
