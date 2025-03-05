const { describe, expect, it, jest } = require('@jest/globals');
const errorHandler = require('../../../src/middleware/errorHandler');
const logger = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  error: jest.fn(),
}));

describe('Error Handler Middleware', () => {
  it('should handle errors in development mode', () => {
    const err = new Error('Test error');
    err.status = 400;

    const req = {
      path: '/test',
      method: 'GET',
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    process.env.NODE_ENV = 'development';

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Test error',
      stack: expect.any(String),
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle errors in production mode', () => {
    const err = new Error('Test error');

    const req = {
      path: '/test',
      method: 'GET',
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    process.env.NODE_ENV = 'production';

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  });

  describe('environment-specific behavior', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const err = new Error('Test error');
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      errorHandler(err, req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        })
      );
    });

    it('should exclude stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const err = new Error('Test error');
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      errorHandler(err, req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.any(String),
        })
      );
    });
  });
});
