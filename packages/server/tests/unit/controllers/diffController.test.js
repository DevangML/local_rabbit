const {
  describe, expect, it, jest,
} = require('@jest/globals');
const diffController = require('../../../src/controllers/diffController');
const GitService = require('../../../src/services/GitService');
const _AnalyzerService = require('../../../src/services/AnalyzerService');

jest.mock('../../../src/services/GitService');
jest.mock('../../../src/services/AnalyzerService');
jest.mock('../../../src/utils/logger');

describe('Diff Controller', () => {
  describe('getDiff', () => {
    it('should return diff between branches', async () => {
      const mockDiff = 'test diff content';
      const mockGitService = {
        repoPath: '/test/repo',
        getDiff: jest.fn().mockResolvedValue(mockDiff),
      };

      GitService.mockImplementation(() => mockGitService);

      const req = {
        body: {
          fromBranch: 'main',
          toBranch: 'develop',
        },
      };
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await diffController.getDiff(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        diff: mockDiff,
        fromBranch: 'main',
        toBranch: 'develop',
      }));
    });
  });

  describe('analyzeDiff', () => {
    // ... similar test setup for analyzeDiff ...
  });
});
