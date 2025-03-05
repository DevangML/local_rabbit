import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Logger from '../../utils/logger';

describe('Logger Utility', () => {
  beforeEach(() => {
    // Mock console methods
    console.error = vi.fn();
    console.warn = vi.fn();
    console.info = vi.fn();
    console.debug = vi.fn();

    // Mock Error constructor to provide a custom stack
    const mockStack = `Error
    at Object.<anonymous> (/src/utils/logger.test.js:10:10)
    at Object.asyncJestTest (/src/utils/logger.test.js:11:11)`;

    vi.spyOn(Error.prototype, 'stack', 'get').mockReturnValue(mockStack);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
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
    vi.spyOn(Error.prototype, 'stack', 'get').mockReturnValue('Invalid stack trace');
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
    const mockStackWithFullPath = `Error
    at Object.<anonymous> (/absolute/path/src/utils/logger.test.js:10:10)`;
    vi.spyOn(Error.prototype, 'stack', 'get').mockReturnValue(mockStackWithFullPath);

    const message = 'Test message';
    const formattedMessage = Logger.formatMessage('info', message);
    expect(formattedMessage).toBe('utils/logger.test.js:10:10: info Test message');
  });

  it('should handle stack traces without src directory', () => {
    const mockStackWithoutSrc = `Error
    at Object.<anonymous> (/absolute/path/utils/logger.test.js:10:10)`;
    vi.spyOn(Error.prototype, 'stack', 'get').mockReturnValue(mockStackWithoutSrc);

    const message = 'Test message';
    const formattedMessage = Logger.formatMessage('info', message);
    expect(formattedMessage).toBe('utils/logger.test.js:10:10: info Test message');
  });
}); 