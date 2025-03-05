const {
  describe, expect, it, beforeEach,
} = require('@jest/globals');
const GitService = require('../../src/services/GitService');
const AnalyzerService = require('../../src/services/AnalyzerService');
const SecureGitService = require('../../src/services/SecureGitService');

describe('Services Integration', () => {
  let gitService;
  let analyzerService;
  let secureGitService;

  beforeEach(() => {
    gitService = new GitService();
    analyzerService = new AnalyzerService();
    secureGitService = new SecureGitService();
  });

  describe('Git Operations', () => {
    it('should handle repository operations', async () => {
      const repoPath = '/test/path';
      gitService.setRepoPath(repoPath);
      expect(gitService.repoPath).toBe(repoPath);
    });
  });

  describe('Analysis Operations', () => {
    it('should analyze diff content', async () => {
      const diffContent = 'test diff content';
      const result = await analyzerService.analyzeDiff(diffContent);
      expect(result).toBeDefined();
    });
  });

  describe('Security Operations', () => {
    it('should validate paths', () => {
      const validPath = '/valid/path';
      const result = secureGitService.isPathAllowed(validPath);
      expect(result).toBeDefined();
    });
  });
});
