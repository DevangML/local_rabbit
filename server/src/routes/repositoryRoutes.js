const express = require('express');
const repositoryController = require('../controllers/repositoryController');

const router = express.Router();

/**
 * @route   GET /api/repositories
 * @desc    Get list of repositories
 * @access  Public
 */
router.get('/repositories', repositoryController.getRepositories);

/**
 * @route   POST /api/repository/set
 * @desc    Set current repository
 * @access  Public
 */
router.post('/repository/set', repositoryController.setRepository);

/**
 * @route   GET /api/repository/branches
 * @desc    Get branches for current repository
 * @access  Public
 */
router.get('/repository/branches', repositoryController.getBranches);

/**
 * @route   GET /api/repository/info
 * @desc    Get current repository info
 * @access  Public
 */
router.get('/repository/info', repositoryController.getRepositoryInfo);

module.exports = router; 