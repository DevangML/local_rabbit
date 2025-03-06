const {
  describe, expect, it, _jest,
} = require('@jest/globals');
const PerformanceAnalyzer = require('../../../src/utils/performance-analyzer');

describe('PerformanceAnalyzer', () => {
  describe('measure', () => {
    it('should measure execution time', async () => {
      const analyzer = new PerformanceAnalyzer();
      const result = await analyzer.measure('test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
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
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      const stats = analyzer.getStats();
      expect(stats).toHaveProperty('test');
      expect(stats.test).toHaveProperty('count');
      expect(stats.test).toHaveProperty('totalTime');
      expect(stats.test).toHaveProperty('avgTime');
    });
  });

  describe('measureSync', () => {
    it('should measure synchronous function execution time', () => {
      const analyzer = new PerformanceAnalyzer();
      const result = analyzer.measureSync('test', () => {
        let sum = 0;
        for (let i = 0; i < 1000000; i++) sum += i;
        return sum;
      });

      expect(result.duration).toBeGreaterThan(0);
      expect(typeof result.result).toBe('number');
    });

    it('should handle sync errors', () => {
      const analyzer = new PerformanceAnalyzer();
      expect(() => analyzer.measureSync('test', () => {
        throw new Error('Sync error');
      })).toThrow('Sync error');
    });
  });

  describe('getMetrics', () => {
    it('should track min/max/avg execution times', async () => {
      const analyzer = new PerformanceAnalyzer();

      for (let i = 0; i < 3; i++) {
        await analyzer.measure('test', async () => {
          await new Promise((resolve) => setTimeout(resolve, 10 * (i + 1)));
        });
      }

      const metrics = analyzer.getMetrics('test');
      expect(metrics.min).toBeLessThan(metrics.max);
      expect(metrics.avg).toBeGreaterThan(metrics.min);
      expect(metrics.avg).toBeLessThan(metrics.max);
    });

    it('should calculate percentiles correctly', async () => {
      const analyzer = new PerformanceAnalyzer();

      for (let i = 0; i < 10; i++) {
        await analyzer.measure('test', async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
        });
      }

      const metrics = analyzer.getMetrics('test');
      expect(metrics.p95).toBeDefined();
      expect(metrics.p99).toBeDefined();
      expect(metrics.p99).toBeGreaterThanOrEqual(metrics.p95);
    });
  });

  describe('reset', () => {
    it('should clear all measurements', async () => {
      const analyzer = new PerformanceAnalyzer();

      await analyzer.measure('test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      analyzer.reset();
      expect(analyzer.getStats()).toEqual({});
    });

    it('should clear specific operation measurements', async () => {
      const analyzer = new PerformanceAnalyzer();

      await analyzer.measure('op1', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      await analyzer.measure('op2', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      analyzer.reset('op1');
      const stats = analyzer.getStats();
      expect(stats.op1).toBeUndefined();
      expect(stats.op2).toBeDefined();
    });
  });
});
