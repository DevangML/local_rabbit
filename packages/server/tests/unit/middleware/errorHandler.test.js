const {
  describe, expect, it, jest,
} = require('@jest/globals');
const errorHandler = require('../../../src/middleware/errorHandler');
const _logger = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  error: jest.fn(),
}));

describe('Error Handler Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      path: '/test',
      method: 'GET',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should handle errors in development mode', () => {
    const err = new Error('Test error');
    err.status = 400;
    process.env.NODE_ENV = 'development';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Test error',
      stack: expect.any(String),
    });
  });

  it('should handle errors in production mode', () => {
    const err = new Error('Test error');
    process.env.NODE_ENV = 'production';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  });

  it('should use custom status code if provided', () => {
    const err = new Error('Test error');
    err.status = 418;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(418);
  });

  it('should handle errors without message', () => {
    const err = new Error();

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Internal Server Error',
    }));
  });

  it('should include request details in log', () => {
    const err = new Error('Test error');
    const logger = require('../../../src/utils/logger');

    errorHandler(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith('Error:', expect.objectContaining({
      path: '/test',
      method: 'GET',
    }));
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
        }),
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
        }),
      );
    });
  });
});
