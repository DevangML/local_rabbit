const { describe, expect, it } = require('@jest/globals');
const AnalyzerService = require('../../../src/services/AnalyzerService');

describe('AnalyzerService', () => {
  const analyzerService = new AnalyzerService();

  describe('parseDiff', () => {
    it('should parse git diff output', () => {
      const diffOutput = `diff --git a/file.js b/file.js
@@ -1,4 +1,4 @@
-old line
+new line
 unchanged line`;

      const result = AnalyzerService.parseDiff(diffOutput);
      expect(result).toHaveLength(1);
      expect(result[0].changes).toHaveLength(3);
    });
  });

  describe('calculateComplexity', () => {
    it('should calculate complexity correctly', () => {
      const file = {
        additions: 5,
        deletions: 3,
      };
      const result = AnalyzerService.calculateComplexity(file);
      expect(result.score).toBeDefined();
      expect(result.changes).toBe(8);
    });
  });

  describe('analyzeDiff', () => {
    it('should analyze diff output', async () => {
      const diffOutput = `diff --git a/file.js b/file.js
@@ -1,4 +1,4 @@
-old line
+new line
 unchanged line`;

      const result = await analyzerService.analyzeDiff(diffOutput);
      expect(result.files).toBeDefined();
      expect(result.summary).toBeDefined();
    });
  });

  describe('getFileType', () => {
    it('should identify file types correctly', () => {
      expect(AnalyzerService.getFileType('js')).toBe('JavaScript');
      expect(AnalyzerService.getFileType('ts')).toBe('TypeScript');
      expect(AnalyzerService.getFileType('unknown')).toBe('Unknown');
    });
  });

  describe('calculateImpactLevel', () => {
    it('should calculate impact level correctly', () => {
      expect(AnalyzerService.calculateImpactLevel({}, { score: 3 })).toBe('high');
      expect(AnalyzerService.calculateImpactLevel({}, { score: 2 })).toBe('medium');
      expect(AnalyzerService.calculateImpactLevel({}, { score: 1 })).toBe('low');
    });
  });

  describe('edge cases', () => {
    it('should handle empty diff output', async () => {
      const result = await analyzerService.analyzeDiff('');
      expect(result.files).toHaveLength(0);
      expect(result.summary.totalFiles).toBe(0);
    });

    it('should handle malformed diff output', async () => {
      const malformedDiff = 'invalid diff format';
      const result = await analyzerService.analyzeDiff(malformedDiff);
      expect(result.files).toHaveLength(0);
    });

    it('should handle unknown file types', () => {
      const result = AnalyzerService.getFileType('xyz');
      expect(result).toBe('Unknown');
    });

    it('should handle extremely large diffs', async () => {
      const largeDiff = 'diff --git a/file b/file\n'.repeat(1000);
      const result = await analyzerService.analyzeDiff(largeDiff);
      expect(result.summary).toBeDefined();
    });
  });

  describe('complexity calculations', () => {
    it('should calculate low complexity correctly', () => {
      const result = AnalyzerService.calculateComplexity({
        additions: 3,
        deletions: 2,
      });
      expect(result.score).toBe(1);
    });

    it('should calculate medium complexity correctly', () => {
      const result = AnalyzerService.calculateComplexity({
        additions: 20,
        deletions: 15,
      });
      expect(result.score).toBe(2);
    });

    it('should calculate high complexity correctly', () => {
      const result = AnalyzerService.calculateComplexity({
        additions: 30,
        deletions: 25,
      });
      expect(result.score).toBe(3);
    });
  });
});
