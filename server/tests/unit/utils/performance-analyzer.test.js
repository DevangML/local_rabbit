const { describe, expect, it } = require('@jest/globals');
const PerformanceAnalyzer = require('../../../src/utils/performance-analyzer');

describe('PerformanceAnalyzer', () => {
  describe('measure', () => {
    it('should measure execution time', async () => {
      const analyzer = new PerformanceAnalyzer();
      const result = await analyzer.measure('test', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'result';
      });

      expect(result.duration).toBeGreaterThanOrEqual(100);
      expect(result.result).toBe('result');
    });

    it('should handle errors', async () => {
      const analyzer = new PerformanceAnalyzer();
      await expect(analyzer.measure('test', async () => {
        throw new Error('Test error');
      })).rejects.toThrow('Test error');
    });
  });

  describe('getStats', () => {
    it('should return performance stats', async () => {
      const analyzer = new PerformanceAnalyzer();
      await analyzer.measure('test', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const stats = analyzer.getStats();
      expect(stats).toHaveProperty('test');
      expect(stats.test).toHaveProperty('count');
      expect(stats.test).toHaveProperty('totalTime');
      expect(stats.test).toHaveProperty('avgTime');
    });
  });
});
