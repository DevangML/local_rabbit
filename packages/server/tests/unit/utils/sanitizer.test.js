const { describe, expect, it } = require('@jest/globals');
const sanitizer = require('../../../src/utils/sanitizer');

describe('Sanitizer', () => {
  describe('sanitizePath', () => {
    it('should normalize paths', () => {
      expect(sanitizer.sanitizePath('/test//path')).toBe('/test/path');
      expect(sanitizer.sanitizePath('path/../file')).toBe('file');
    });

    it('should handle empty paths', () => {
      expect(sanitizer.sanitizePath('')).toBe('');
      expect(sanitizer.sanitizePath(null)).toBe('');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizer.sanitizePath('/test/;rm -rf;/path'))
        .toBe('/test/path');
    });
  });

  describe('sanitizeInput', () => {
    it('should escape HTML', () => {
      expect(sanitizer.sanitizeInput('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should handle objects', () => {
      const input = { key: '<script>alert("xss")</script>' };
      const result = sanitizer.sanitizeInput(input);
      expect(result.key).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should handle arrays', () => {
      const input = ['<script>alert("xss")</script>'];
      const result = sanitizer.sanitizeInput(input);
      expect(result[0]).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });
  });

  describe('sanitizeBranchName', () => {
    it('should clean branch names', () => {
      expect(sanitizer.sanitizeBranchName('feature/test'))
        .toBe('feature/test');
      expect(sanitizer.sanitizeBranchName('main;rm -rf;'))
        .toBe('main');
    });

    it('should handle invalid branch names', () => {
      expect(sanitizer.sanitizeBranchName('')).toBe('');
      expect(sanitizer.sanitizeBranchName('../hack')).toBe('hack');
    });
  });

  describe('sanitizeJSON', () => {
    it('should clean JSON objects', () => {
      const input = {
        key: '<script>alert("xss")</script>',
        nested: { key: '../hack' },
      };
      const result = sanitizer.sanitizeJSON(input);
      expect(result.key).not.toContain('<script>');
      expect(result.nested.key).toBe('hack');
    });
  });
});
