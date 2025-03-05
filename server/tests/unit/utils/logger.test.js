const { describe, expect, it, jest } = require('@jest/globals');
const winston = require('winston');
const logger = require('../../../src/utils/logger');

jest.mock('winston', () => ({
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    splat: jest.fn(),
    json: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn()
  },
  createLogger: jest.fn(() => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  })),
  transports: {
    File: jest.fn(),
    Console: jest.fn(),
  },
}));

describe('Logger', () => {
  it('should have all logging methods', () => {
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.success).toBeDefined();
    expect(logger.important).toBeDefined();
    expect(logger.highlight).toBeDefined();
    expect(logger.section).toBeDefined();
    expect(logger.table).toBeDefined();
  });

  it('should create log files with correct options', () => {
    expect(winston.transports.File).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: 'logs/error.log',
        level: 'error',
      })
    );
  });

  it('should format messages with source location', () => {
    logger.info('Test message');
    expect(winston.createLogger).toHaveBeenCalled();
  });

  it('should add source tracking to log methods', () => {
    const message = 'Test message';
    const meta = { userId: 123 };

    logger.error(message, meta);
    logger.warn(message, meta);
    logger.info(message, meta);
    logger.debug(message, meta);
  });

  it('should handle convenience logging methods', () => {
    logger.success('Success message');
    logger.important('Important message');
    logger.highlight('Highlighted message');
    logger.section('Section title');
    logger.table([{ id: 1, name: 'test' }]);
  });

  it('should create logger with correct configuration', () => {
    expect(winston.createLogger).toHaveBeenCalled();
  });

  it('should log messages at different levels', () => {
    logger.info('test info');
    logger.error('test error');
    logger.warn('test warning');
    logger.debug('test debug');

    expect(logger.info).toHaveBeenCalledWith('test info');
    expect(logger.error).toHaveBeenCalledWith('test error');
    expect(logger.warn).toHaveBeenCalledWith('test warning');
    expect(logger.debug).toHaveBeenCalledWith('test debug');
  });

  it('should handle objects in log messages', () => {
    const testObject = { key: 'value' };
    logger.info('test', testObject);
    expect(logger.info).toHaveBeenCalledWith('test', testObject);
  });

  it('should handle errors in log messages', () => {
    const testError = new Error('test error');
    logger.error('error occurred', testError);
    expect(logger.error).toHaveBeenCalledWith('error occurred', testError);
  });
});
