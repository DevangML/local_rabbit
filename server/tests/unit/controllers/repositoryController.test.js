const { describe, expect, it, jest } = require('@jest/globals');
const repositoryController = require('../../../src/controllers/repositoryController');
const GitService = require('../../../src/services/GitService');

jest.mock('../../../src/services/GitService');
jest.mock('../../../src/utils/logger');

describe('Repository Controller', () => {
  describe('getRepositories', () => {
    it('should return list of repositories', async () => {
      const mockRepos = [{ path: '/test/repo', name: 'test-repo' }];
      GitService.findRepositories.mockResolvedValue(mockRepos);

      const req = {};
      const res = {
        json: jest.fn(),
      };

      await repositoryController.getRepositories(req, res);
      expect(res.json).toHaveBeenCalledWith(mockRepos);
    });
  });

  describe('setRepository', () => {
    it('should set repository path and return repository info', async () => {
      const mockGitService = {
        setRepoPath: jest.fn(),
        isValidRepo: jest.fn().mockResolvedValue(true),
        getBranches: jest.fn().mockResolvedValue({ all: ['main'] }),
        getCurrentBranch: jest.fn().mockResolvedValue('main'),
        saveState: jest.fn(),
      };

      GitService.mockImplementation(() => mockGitService);

      const req = {
        body: { path: '/test/repo' },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await repositoryController.setRepository(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        path: '/test/repo',
        branches: ['main'],
        current: 'main',
      }));
    });
  });

  describe('error handling', () => {
    it('should handle missing repository path', async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await repositoryController.setRepository(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Repository path is required' })
      );
    });

    it('should handle invalid repository path', async () => {
      const req = {
        body: { path: '/invalid/path' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      gitService.isValidRepo = jest.fn().mockResolvedValue(false);

      await repositoryController.setRepository(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Not a valid git repository' })
      );
    });

    it('should handle getBranches with no repository selected', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      gitService.repoPath = null;

      await repositoryController.getBranches(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No repository selected' })
      );
    });
  });

  describe('tilde expansion', () => {
    it('should handle tilde paths correctly', async () => {
      const req = {
        body: { path: '~/Documents/repo' },
      };
      const res = {
        json: jest.fn(),
      };

      gitService.isValidRepo = jest.fn().mockResolvedValue(true);
      gitService.getBranches = jest.fn().mockResolvedValue({ all: ['main'] });
      gitService.getCurrentBranch = jest.fn().mockResolvedValue('main');

      await repositoryController.setRepository(req, res);

      expect(gitService.setRepoPath).toHaveBeenCalledWith(
        expect.stringContaining('/Documents/repo')
      );
    });
  });
});
