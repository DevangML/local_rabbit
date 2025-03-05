import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Logger from '../../utils/logger';

describe('Logger Utility', () => {
  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(console, 'warn').mockImplementation(() => { });
    vi.spyOn(console, 'info').mockImplementation(() => { });
    vi.spyOn(console, 'debug').mockImplementation(() => { });

    // Mock Error.stack for consistent testing
    vi.spyOn(Error.prototype, 'stack', 'get').mockImplementation(() => {
      return `Error
    at Object.<anonymous> (/fake/path/src/utils/logger.test.js:10:10)
    at Object.<anonymous> (/fake/path/src/components/TestComponent.jsx:20:30)`;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should format message with correct level and location', () => {
    const formattedMessage = Logger.formatMessage('test', 'Test message');
    expect(formattedMessage).toContain('components/TestComponent.jsx:20:30');
    expect(formattedMessage).toContain('test Test message');
  });

  it('should include metadata in formatted message', () => {
    const meta = { userId: 123, action: 'login' };
    const formattedMessage = Logger.formatMessage('test', 'Test message', meta);
    expect(formattedMessage).toContain(JSON.stringify(meta));
  });

  it('should handle missing stack trace information', () => {
    // Mock a stack trace without file information
    vi.spyOn(Error.prototype, 'stack', 'get').mockImplementation(() => {
      return `Error
    at Object.<anonymous>
    at runMicrotasks`;
    });

    const formattedMessage = Logger.formatMessage('test', 'Test message');
    expect(formattedMessage).toBe('logger.js:1:1: test Test message');
  });

  it('should log error messages', () => {
    Logger.error('Error message');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('error Error message'));
  });

  it('should log warning messages', () => {
    Logger.warn('Warning message');
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('warning Warning message'));
  });

  it('should log info messages', () => {
    Logger.info('Info message');
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('info Info message'));
  });

  it('should log debug messages', () => {
    Logger.debug('Debug message');
    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenCalledWith(expect.stringContaining('debug Debug message'));
  });

  it('should log error messages with metadata', () => {
    const meta = { code: 500, endpoint: '/api/users' };
    Logger.error('API error', meta);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(JSON.stringify(meta))
    );
  });

  it('should extract relative file path from stack trace', () => {
    // Mock a stack trace with a full path
    vi.spyOn(Error.prototype, 'stack', 'get').mockImplementation(() => {
      return `Error
    at Object.<anonymous> (/fake/path/src/utils/logger.test.js:10:10)
    at Object.<anonymous> (/fake/path/src/components/DeepNested/Component.jsx:25:15)`;
    });

    const formattedMessage = Logger.formatMessage('test', 'Test message');
    expect(formattedMessage).toContain('components/DeepNested/Component.jsx:25:15');
    expect(formattedMessage).not.toContain('/fake/path/src/');
  });

  it('should handle stack traces without src directory', () => {
    // Mock a stack trace without src directory
    vi.spyOn(Error.prototype, 'stack', 'get').mockImplementation(() => {
      return `Error
    at Object.<anonymous> (/fake/path/logger.test.js:10:10)
    at Object.<anonymous> (/fake/path/Component.jsx:25:15)`;
    });

    const formattedMessage = Logger.formatMessage('test', 'Test message');
    expect(formattedMessage).toContain('/fake/path/Component.jsx:25:15');
  });
}); 