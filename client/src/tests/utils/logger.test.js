import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Logger from '../../utils/logger';

describe('Logger Utility', () => {
  let originalStack;

  beforeEach(() => {
    // Store original stack getter
    originalStack = Object.getOwnPropertyDescriptor(Error.prototype, 'stack');

    // Mock console methods
    console.error = vi.fn();
    console.warn = vi.fn();
    console.info = vi.fn();
    console.debug = vi.fn();

    // Mock stack trace
    const mockStack = `Error
    at Object.<anonymous> (/src/utils/logger.test.js:10:10)
    at Object.asyncJestTest (/src/utils/logger.test.js:11:11)`;

    Object.defineProperty(Error.prototype, 'stack', {
      get: () => mockStack
    });
  });

  afterEach(() => {
    // Restore original stack getter
    if (originalStack) {
      Object.defineProperty(Error.prototype, 'stack', originalStack);
    }
    vi.clearAllMocks();
  });

  it('should format message with correct level and location', () => {
    const message = 'Test message';
    const formattedMessage = Logger.formatMessage('info', message);
    expect(formattedMessage).toBe('utils/logger.test.js:10:10: info Test message');
  });

  it('should include metadata in formatted message', () => {
    const message = 'Test message';
    const meta = { key: 'value' };
    const formattedMessage = Logger.formatMessage('info', message, meta);
    expect(formattedMessage).toBe('utils/logger.test.js:10:10: info Test message {"key":"value"}');
  });

  it('should handle missing stack trace information', () => {
    // Temporarily override stack with invalid format
    Object.defineProperty(Error.prototype, 'stack', {
      get: () => 'Invalid stack trace'
    });
    const message = 'Test message';
    const formattedMessage = Logger.formatMessage('info', message);
    expect(formattedMessage).toBe('logger.js:1:1: info Test message');
  });

  it('should log error messages', () => {
    const message = 'Error message';
    Logger.error(message);
    expect(console.error).toHaveBeenCalledWith('utils/logger.test.js:10:10: error Error message');
  });

  it('should log warning messages', () => {
    const message = 'Warning message';
    Logger.warn(message);
    expect(console.warn).toHaveBeenCalledWith('utils/logger.test.js:10:10: warning Warning message');
  });

  it('should log info messages', () => {
    const message = 'Info message';
    Logger.info(message);
    expect(console.info).toHaveBeenCalledWith('utils/logger.test.js:10:10: info Info message');
  });

  it('should log debug messages', () => {
    const message = 'Debug message';
    Logger.debug(message);
    expect(console.debug).toHaveBeenCalledWith('utils/logger.test.js:10:10: debug Debug message');
  });

  it('should log error messages with metadata', () => {
    const message = 'Error with metadata';
    const meta = { code: 500 };
    Logger.error(message, meta);
    expect(console.error).toHaveBeenCalledWith('utils/logger.test.js:10:10: error Error with metadata {"code":500}');
  });

  it('should extract relative file path from stack trace', () => {
    const message = 'Test message';
    const formattedMessage = Logger.formatMessage('info', message);
    expect(formattedMessage).toBe('utils/logger.test.js:10:10: info Test message');
  });

  it('should handle stack traces without src directory', () => {
    // Mock stack trace without src directory
    Object.defineProperty(Error.prototype, 'stack', {
      get: () => `Error
      at Object.<anonymous> (utils/logger.test.js:10:10)
      at Object.asyncJestTest (utils/logger.test.js:11:11)`
    });
    const message = 'Test message';
    const formattedMessage = Logger.formatMessage('info', message);
    expect(formattedMessage).toBe('utils/logger.test.js:10:10: info Test message');
  });
}); 