const { describe, expect, it, jest, beforeEach } = require('@jest/globals');
const path = require('path');
const fs = require('fs').promises;
const GitService = require('../../../src/services/GitService');
const logger = require('../../../src/utils/logger');

jest.mock('simple-git');
jest.mock('../../../src/utils/logger');

describe('GitService', () => {
  let gitService;

  beforeEach(() => {
    gitService = new GitService();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(gitService.repoPath).toBeNull();
      expect(gitService.git).toBeNull();
    });

    it('should load state from file', async () => {
      const mockState = { repoPath: '/test/path' };
      jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(mockState));

      await gitService.loadState();
      expect(gitService.repoPath).toBe(mockState.repoPath);
    });

    it('should handle missing state file', async () => {
      jest.spyOn(fs, 'readFile').mockRejectedValue(new Error('ENOENT'));

      await gitService.loadState();
      expect(gitService.repoPath).toBeNull();
    });
  });

  describe('repository operations', () => {
    it('should set repository path', () => {
      const testPath = '/test/repo';
      gitService.setRepoPath(testPath);
      expect(gitService.repoPath).toBe(testPath);
    });

    it('should get branches', async () => {
      gitService.git = {
        branch: jest.fn().mockResolvedValue({
          all: ['main', 'develop'],
          current: 'main'
        })
      };

      const branches = await gitService.getBranches();
      expect(branches.all).toContain('main');
      expect(branches.all).toContain('develop');
    });

    it('should get current branch', async () => {
      gitService.git = {
        branch: jest.fn().mockResolvedValue({
          current: 'main'
        })
      };

      const branch = await gitService.getCurrentBranch();
      expect(branch).toBe('main');
    });

    it('should get diff between branches', async () => {
      gitService.git = {
        diff: jest.fn().mockResolvedValue('test diff output')
      };

      const diff = await gitService.getDiff('main', 'develop');
      expect(diff).toBe('test diff output');
    });
  });

  describe('error handling', () => {
    it('should handle git command errors', async () => {
      gitService.git = {
        branch: jest.fn().mockRejectedValue(new Error('Git error'))
      };

      await expect(gitService.getBranches()).rejects.toThrow('Git error');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle invalid repository paths', () => {
      expect(() => gitService.setRepoPath('')).toThrow();
      expect(() => gitService.setRepoPath(null)).toThrow();
    });

    it('should handle state save errors', async () => {
      jest.spyOn(fs, 'writeFile').mockRejectedValue(new Error('Write error'));

      await expect(gitService.saveState()).rejects.toThrow('Write error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('state management', () => {
    it('should save state to file', async () => {
      const writeFile = jest.spyOn(fs, 'writeFile').mockResolvedValue();
      gitService.repoPath = '/test/repo';

      await gitService.saveState();
      expect(writeFile).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify({ repoPath: '/test/repo' }),
        'utf8'
      );
    });

    it('should handle state file corruption', async () => {
      jest.spyOn(fs, 'readFile').mockResolvedValue('invalid json');

      await gitService.loadState();
      expect(logger.error).toHaveBeenCalled();
      expect(gitService.repoPath).toBeNull();
    });
  });

  describe('utility methods', () => {
    it('should check if path is git repository', async () => {
      gitService.git = {
        checkIsRepo: jest.fn().mockResolvedValue(true)
      };

      const isRepo = await gitService.isGitRepository('/test/path');
      expect(isRepo).toBe(true);
    });

    it('should handle non-git directories', async () => {
      gitService.git = {
        checkIsRepo: jest.fn().mockResolvedValue(false)
      };

      const isRepo = await gitService.isGitRepository('/test/path');
      expect(isRepo).toBe(false);
    });
  });
});
