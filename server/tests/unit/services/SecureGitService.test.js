const { describe, expect, it, jest } = require('@jest/globals');
const path = require('path');
const os = require('os');
const fs = require('fs').promises;
const SecureGitService = require('../../../src/services/SecureGitService');

describe('SecureGitService', () => {
  let secureGitService;

  beforeEach(() => {
    secureGitService = new SecureGitService();
  });

  describe('setRepositoryPath', () => {
    it('should set valid repository path', () => {
      const validPath = path.join(os.homedir(), 'Documents/test-repo');
      const result = secureGitService.setRepositoryPath(validPath);
      expect(result).toBe(true);
      expect(secureGitService.currentRepoPath).toBe(validPath);
    });

    it('should reject invalid repository path', () => {
      const invalidPath = '/var/root/forbidden';
      const result = secureGitService.setRepositoryPath(invalidPath);
      expect(result).toBe(false);
    });

    it('should handle tilde expansion', () => {
      const tildePath = '~/Documents/test-repo';
      const expandedPath = path.join(os.homedir(), 'Documents/test-repo');
      const result = secureGitService.setRepositoryPath(tildePath);
      expect(result).toBe(true);
      expect(secureGitService.currentRepoPath).toBe(expandedPath);
    });

    it('should reject path traversal attempts', () => {
      const traversalPath = path.join(os.homedir(), 'Documents/../../../etc');
      const result = secureGitService.setRepositoryPath(traversalPath);
      expect(result).toBe(false);
    });
  });

  describe('isValidRepo', () => {
    it('should return false for invalid path', async () => {
      const result = await secureGitService.isValidRepo('/invalid/path');
      expect(result).toBe(false);
    });

    it('should handle null/undefined paths', async () => {
      expect(await secureGitService.isValidRepo(null)).toBe(false);
      expect(await secureGitService.isValidRepo(undefined)).toBe(false);
    });
  });

  describe('findRepositories', () => {
    it('should only search in allowed directories', async () => {
      const repos = await SecureGitService.findRepositories();
      expect(Array.isArray(repos)).toBe(true);

      // Verify all found repos are in allowed directories
      const allowedDirs = [
        'Documents', 'Projects', 'Development', 'Code',
        'Github', 'repos', 'git', 'workspace', 'dev', 'Desktop'
      ].map(dir => path.join(os.homedir(), dir));

      repos.forEach(repo => {
        const isInAllowedDir = allowedDirs.some(dir => repo.path.startsWith(dir));
        expect(isInAllowedDir).toBe(true);
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock os.homedir to return invalid path
      const originalHomedir = os.homedir;
      os.homedir = jest.fn().mockReturnValue('/invalid/home');

      const repos = await SecureGitService.findRepositories();
      expect(Array.isArray(repos)).toBe(true);
      expect(repos).toHaveLength(0);

      os.homedir = originalHomedir;
    });
  });

  describe('searchDirectory', () => {
    it('should handle permission errors', async () => {
      const mockFs = {
        readdir: jest.fn().mockRejectedValue(new Error('Permission denied'))
      };
      jest.spyOn(fs, 'readdir').mockImplementation(mockFs.readdir);

      const repos = [];
      await SecureGitService.searchDirectory('/test/path', repos);
      expect(repos).toHaveLength(0);
    });

    it('should respect max depth', async () => {
      const mockFs = {
        readdir: jest.fn().mockResolvedValue([
          { name: 'subdir', isDirectory: () => true }
        ])
      };
      jest.spyOn(fs, 'readdir').mockImplementation(mockFs.readdir);

      const repos = [];
      await SecureGitService.searchDirectory('/test/path', repos, 4);
      expect(mockFs.readdir).not.toHaveBeenCalled();
    });

    it('should skip hidden directories', async () => {
      const mockFs = {
        readdir: jest.fn().mockResolvedValue([
          { name: '.hidden', isDirectory: () => true },
          { name: 'visible', isDirectory: () => true }
        ])
      };
      jest.spyOn(fs, 'readdir').mockImplementation(mockFs.readdir);

      const repos = [];
      await SecureGitService.searchDirectory('/test/path', repos);
      expect(mockFs.readdir).toHaveBeenCalledTimes(1);
    });
  });

  describe('isPathAllowed', () => {
    let secureGitService;

    beforeEach(() => {
      secureGitService = new SecureGitService();
    });

    it('should allow paths in allowed directories', () => {
      const validPath = path.join(os.homedir(), 'Documents/repo');
      expect(secureGitService.isPathAllowed(validPath)).toBe(true);
    });

    it('should reject paths outside allowed directories', () => {
      const invalidPath = '/var/tmp/repo';
      expect(secureGitService.isPathAllowed(invalidPath)).toBe(false);
    });

    it('should reject paths with directory traversal', () => {
      const traversalPath = path.join(os.homedir(), 'Documents/../etc');
      expect(secureGitService.isPathAllowed(traversalPath)).toBe(false);
    });

    it('should handle symlinks correctly', () => {
      const symlinkPath = path.join(os.homedir(), 'Documents/link');
      expect(secureGitService.isPathAllowed(symlinkPath)).toBe(true);
    });
  });

  describe('error handling', () => {
    let secureGitService;

    beforeEach(() => {
      secureGitService = new SecureGitService();
    });

    it('should handle null repository paths', () => {
      expect(secureGitService.setRepositoryPath(null)).toBe(false);
    });

    it('should handle undefined repository paths', () => {
      expect(secureGitService.setRepositoryPath(undefined)).toBe(false);
    });

    it('should handle empty repository paths', () => {
      expect(secureGitService.setRepositoryPath('')).toBe(false);
    });

    it('should handle invalid path types', () => {
      expect(secureGitService.setRepositoryPath(123)).toBe(false);
      expect(secureGitService.setRepositoryPath({})).toBe(false);
      expect(secureGitService.setRepositoryPath([])).toBe(false);
    });
  });

  describe('repository validation', () => {
    let secureGitService;

    beforeEach(() => {
      secureGitService = new SecureGitService();
    });

    it('should validate git repository existence', async () => {
      const mockFs = {
        access: jest.fn().mockResolvedValue(undefined)
      };
      jest.spyOn(fs, 'access').mockImplementation(mockFs.access);

      const validPath = path.join(os.homedir(), 'Documents/repo');
      const isValid = await secureGitService.isValidRepo(validPath);
      expect(isValid).toBe(true);
    });

    it('should reject non-git directories', async () => {
      const mockFs = {
        access: jest.fn().mockRejectedValue(new Error('ENOENT'))
      };
      jest.spyOn(fs, 'access').mockImplementation(mockFs.access);

      const nonGitPath = path.join(os.homedir(), 'Documents/non-git');
      const isValid = await secureGitService.isValidRepo(nonGitPath);
      expect(isValid).toBe(false);
    });
  });
});
