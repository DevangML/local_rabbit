const {
  describe, expect, it, jest,
} = require('@jest/globals');
const validation = require('../../../src/middleware/validation');

describe('Validation Middleware', () => {
  describe('validateRepository', () => {
    it('should validate repository path', () => {
      const req = {
        body: { path: '/valid/path' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      validation.validateRepository(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid repository paths', () => {
      const req = {
        body: { path: '../invalid/path' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      validation.validateRepository(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateBranchNames', () => {
    it('should validate branch names', () => {
      const req = {
        body: {
          fromBranch: 'main',
          toBranch: 'develop',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      validation.validateBranchNames(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid branch names', () => {
      const req = {
        body: {
          fromBranch: 'main/../hack',
          toBranch: 'develop',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      validation.validateBranchNames(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateFilePath', () => {
    it('should validate file paths', () => {
      const req = {
        params: { filePath: 'src/index.js' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      validation.validateFilePath(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should reject path traversal attempts', () => {
      const req = {
        params: { filePath: '../config/secrets.js' },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      validation.validateFilePath(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('sanitizePath', () => {
    it('should sanitize paths', () => {
      expect(validation.sanitizePath('/test/../path')).toBe('/path');
      expect(validation.sanitizePath('../../hack')).toBe('hack');
    });
  });
});
