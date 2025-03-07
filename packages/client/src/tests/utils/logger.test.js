import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../../utils/logger';

describe('Logger Utility', () => {
  let originalStack;

  beforeEach(() => {
  // Mock console methods
  console.error = vi.fn();
  console.warn = vi.fn();
  console.info = vi.fn();
  console.debug = vi.fn();

  // Store original stack getter
  originalStack = Object.getOwnPropertyDescriptor(Error.prototype, 'stack');

  // Mock stack trace
  const mockStack = `Error: test error
  at Object.<anonymous> (src/tests/utils/logger.test.js:10:20)
  at Object.asyncJestTest (/path/to/project/node_modules/jest-jasmine2/build/jasmineAsyncInstall.js:100:37)`;

  // Mock Error.stack
  Object.defineProperty(Error.prototype, 'stack', {
  get: () => mockStack,
  configurable: true
  });
  });

  afterEach(() => {
  vi.clearAllMocks();

  // Restore original stack getter
  if (originalStack) {
  Object.defineProperty(Error.prototype, 'stack', originalStack);
  }
  });

  test('should format message with correct level and location', () => {
  const message = Logger.formatMessage('error', 'test message');
  expect(message).toContain('logger.test.js');
  expect(message).toContain('test message');
  });

  test('should include metadata in formatted message', () => {
  const metadata = { key: 'value' };
  const message = Logger.formatMessage('error', 'test message', metadata);
  expect(message).toContain(JSON.stringify(metadata));
  });

  test('should handle missing stack trace information', () => {
  // Mock stack without file information
  Object.defineProperty(Error.prototype, 'stack', {
  get: () => 'Error: test error',
  configurable: true
  });
  const message = Logger.formatMessage('error', 'test message');
  expect(message).toContain('unknown:0:0');
  });

  test('should log error messages', () => {
  Logger.error('test error');
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining('test error'));
  });

  test('should log warning messages', () => {
  Logger.warn('test warning');
  expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('test warning'));
  });

  test('should log info messages', () => {
  Logger.info('test info');
  expect(console.info).toHaveBeenCalledWith(expect.stringContaining('test info'));
  });

  test('should log debug messages', () => {
  Logger.debug('test debug');
  expect(console.debug).toHaveBeenCalledWith(expect.stringContaining('test debug'));
  });

  test('should log error messages with metadata', () => {
  const metadata = { key: 'value' };
  Logger.error('test error', metadata);
  expect(console.error).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(metadata)));
  });

  test('should extract relative file path from stack trace', () => {
  const message = Logger.formatMessage('error', 'test message');
  expect(message).toContain('logger.test.js');
  });

  test('should handle stack traces without src directory', () => {
  Object.defineProperty(Error.prototype, 'stack', {
  get: () => 'Error: test error\n  at Object.<anonymous> (file.js:10:20)',
  configurable: true
  });
  const message = Logger.formatMessage('error', 'test message');
  expect(message).toContain('file.js');
  });
}); 