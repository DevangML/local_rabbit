const {
  describe, expect, it, jest, beforeEach,
} = require('@jest/globals');
const repositoryController = require('../../../src/controllers/repositoryController');
const GitService = require('../../../src/services/GitService');

jest.mock('../../../src/services/GitService');
jest.mock('../../../src/utils/logger');

describe('Repository Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    GitService.mockClear();
  });

  describe('getRepositories', () => {
    it('should return list of repositories', async () => {
      const mockRepos = [{ path: '/test/repo', name: 'test-repo' }];
      GitService.findRepositories.mockResolvedValue(mockRepos);

      await repositoryController.getRepositories(req, res);
      expect(res.json).toHaveBeenCalledWith(mockRepos);
    });

    it('should handle errors', async () => {
      GitService.findRepositories.mockRejectedValue(new Error('Test error'));
      await repositoryController.getRepositories(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('setRepository', () => {
    beforeEach(() => {
      req.body.path = '/test/repo';
    });

    it('should set repository path successfully', async () => {
      const mockGitService = {
        setRepoPath: jest.fn(),
        isValidRepo: jest.fn().mockResolvedValue(true),
        getBranches: jest.fn().mockResolvedValue({ all: ['main'] }),
        getCurrentBranch: jest.fn().mockResolvedValue('main'),
        saveState: jest.fn(),
      };

      GitService.mockImplementation(() => mockGitService);

      await repositoryController.setRepository(req, res);
      expect(res.json).toHaveBeenCalledWith({
        path: '/test/repo',
        branches: ['main'],
        current: 'main',
      });
    });

    it('should handle invalid repository paths', async () => {
      const mockGitService = {
        isValidRepo: jest.fn().mockResolvedValue(false),
      };
      GitService.mockImplementation(() => mockGitService);

      await repositoryController.setRepository(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle missing path parameter', async () => {
      req.body = {};
      await repositoryController.setRepository(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getBranches', () => {
    it('should return branches for current repository', async () => {
      const mockGitService = {
        repoPath: '/test/repo',
        getBranches: jest.fn().mockResolvedValue({ all: ['main'] }),
        getCurrentBranch: jest.fn().mockResolvedValue('main'),
      };
      GitService.mockImplementation(() => mockGitService);

      await repositoryController.getBranches(req, res);
      expect(res.json).toHaveBeenCalledWith({
        branches: ['main'],
        current: 'main',
      });
    });

    it('should handle no repository selected', async () => {
      const mockGitService = {
        repoPath: null,
      };
      GitService.mockImplementation(() => mockGitService);

      await repositoryController.getBranches(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getRepositoryInfo', () => {
    it('should return repository info', async () => {
      const mockGitService = {
        repoPath: '/test/repo',
        getBranches: jest.fn().mockResolvedValue({ all: ['main'] }),
        getCurrentBranch: jest.fn().mockResolvedValue('main'),
      };
      GitService.mockImplementation(() => mockGitService);

      await repositoryController.getRepositoryInfo(req, res);
      expect(res.json).toHaveBeenCalledWith({
        path: '/test/repo',
        name: 'repo',
        branches: ['main'],
        current: 'main',
      });
    });

    it('should handle errors', async () => {
      const mockGitService = {
        repoPath: '/test/repo',
        getBranches: jest.fn().mockRejectedValue(new Error('Test error')),
      };
      GitService.mockImplementation(() => mockGitService);

      await repositoryController.getRepositoryInfo(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('error handling', () => {
    it('should handle missing repository path', async () => {
      req.body = {};
      await repositoryController.setRepository(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Repository path is required' }),
      );
    });

    it('should handle invalid repository path', async () => {
      req.body.path = '/invalid/path';
      const mockGitService = {
        isValidRepo: jest.fn().mockResolvedValue(false),
      };
      GitService.mockImplementation(() => mockGitService);

      await repositoryController.setRepository(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Not a valid git repository' }),
      );
    });

    it('should handle getBranches with no repository selected', async () => {
      const mockGitService = {
        repoPath: null,
      };
      GitService.mockImplementation(() => mockGitService);

      await repositoryController.getBranches(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No repository selected' }),
      );
    });
  });

  describe('tilde expansion', () => {
    it('should handle tilde paths correctly', async () => {
      req.body.path = '~/Documents/repo';
      const mockGitService = {
        isValidRepo: jest.fn().mockResolvedValue(true),
        getBranches: jest.fn().mockResolvedValue({ all: ['main'] }),
        getCurrentBranch: jest.fn().mockResolvedValue('main'),
      };
      GitService.mockImplementation(() => mockGitService);

      await repositoryController.setRepository(req, res);

      expect(mockGitService.setRepoPath).toHaveBeenCalledWith(
        expect.stringContaining('/Documents/repo'),
      );
    });
  });
});
