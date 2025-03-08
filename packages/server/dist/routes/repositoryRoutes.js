const express = require('express');
const repositoryController = require('../controllers/repositoryController');

const router = express.Router();

/**
 * @route   GET /api/git/repositories
 * @desc    Get list of repositories
 * @access  Public
 */
router.get('/git/repositories', repositoryController.getRepositories);

/**
 * @route   POST /api/git/repository/set
 * @desc    Set current repository
 * @access  Public
 */
router.post('/git/repository/set', repositoryController.setRepository);

/**
 * @route   GET /api/git/repository/branches
 * @desc    Get branches for current repository
 * @access  Public
 */
router.get('/git/repository/branches', repositoryController.getBranches);

/**
 * @route   GET /api/git/repository/info
 * @desc    Get current repository info
 * @access  Public
 */
router.get('/git/repository/info', repositoryController.getRepositoryInfo);

module.exports = router;
