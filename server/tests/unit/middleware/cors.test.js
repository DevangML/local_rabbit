const { describe, expect, it, jest } = require('@jest/globals');
const cors = require('cors');
const corsMiddleware = require('../../../src/middleware/cors');
const config = require('../../../src/config');

jest.mock('cors', () => jest.fn(() => (req, res, next) => next()));

describe('CORS Middleware', () => {
  it('should configure cors with correct options', () => {
    expect(cors).toHaveBeenCalledWith({
      origin: config.cors.origin,
      methods: config.cors.methods,
      allowedHeaders: config.cors.allowedHeaders,
      credentials: config.cors.credentials,
      optionsSuccessStatus: 200,
    });
  });

  it('should be a function', () => {
    expect(typeof corsMiddleware).toBe('function');
  });
});
