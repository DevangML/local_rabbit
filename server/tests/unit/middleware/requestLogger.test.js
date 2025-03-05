const { describe, expect, it, jest } = require('@jest/globals');
const requestLogger = require('../../../src/middleware/requestLogger');
const logger = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
}));

describe('Request Logger Middleware', () => {
  it('should log requests', () => {
    const req = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-agent'),
    };

    const res = {
      statusCode: 200,
      on: jest.fn().mockImplementation((event, cb) => {
        if (event === 'finish') {
          cb();
        }
      }),
    };

    const next = jest.fn();

    requestLogger(req, res, next);

    expect(logger.info).toHaveBeenCalledWith('GET /test', expect.any(Object));
    expect(next).toHaveBeenCalled();
  });

  it('should log response status and duration', () => {
    jest.useFakeTimers();

    const req = {
      method: 'POST',
      url: '/api/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-agent'),
    };

    const res = {
      statusCode: 404,
      on: jest.fn().mockImplementation((event, cb) => {
        if (event === 'finish') {
          jest.advanceTimersByTime(100);
          cb();
        }
      }),
    };

    requestLogger(req, res, jest.fn());

    expect(logger.warn).toHaveBeenCalledWith(
      'POST /api/test 404 - 100ms',
      expect.any(Object)
    );

    jest.useRealTimers();
  });
});
