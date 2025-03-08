const os = require('os');
const logger = require('./logger');

/**
 * @typedef {Object} SystemMetrics
 * @property {string} timestamp - ISO timestamp
 * @property {Object} memory - Memory metrics
 * @property {number} memory.total - Total memory
 * @property {number} memory.free - Free memory
 * @property {number} memory.used - Used memory
 * @property {string} memory.usage - Memory usage percentage
 * @property {Object} cpu - CPU metrics
 * @property {number[]} cpu.loadAvg - Load averages
 * @property {number} cpu.cpus - Number of CPUs
 * @property {number} uptime - System uptime
 * @property {Object} [process] - Process metrics
 */

class MonitoringUtils {
  static getSystemMetrics() {
    /** @type {SystemMetrics} */
    const metrics = {
      timestamp: new Date().toISOString(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2),
      },
      cpu: {
        loadAvg: os.loadavg(),
        cpus: os.cpus().length,
      },
      uptime: os.uptime(),
    };

    // Add process-specific metrics
    metrics.process = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      pid: process.pid,
    };

    return metrics;
  }

  static logSystemMetrics(interval = 300000) { // Default: 5 minutes
    const logMetrics = () => {
      const metrics = this.getSystemMetrics();
      logger.info('System Metrics:', metrics);

      // Alert on high memory usage
      if (parseFloat(metrics.memory.usage) > 90) {
        logger.warn('High memory usage detected:', metrics.memory);
      }

      // Alert on high CPU load
      if (Array.isArray(metrics.cpu.loadAvg) && metrics.cpu.loadAvg.length > 0) {
        // Use type assertion to tell TypeScript we know what we're doing
        const cpuCount = /** @type {number} */ (metrics.cpu.cpus);
        // Safely access the first element of the array
        const loadAvg = metrics.cpu.loadAvg[0] || 0;
        if (loadAvg > cpuCount * 0.8) {
          logger.warn('High CPU load detected:', metrics.cpu);
        }
      }
    };

    logMetrics(); // Initial log
    return setInterval(logMetrics, interval);
  }

  static getProcessMetrics() {
    const usage = process.memoryUsage();
    return {
      heapTotal: usage.heapTotal,
      heapUsed: usage.heapUsed,
      rss: usage.rss,
      external: usage.external,
      uptime: process.uptime(),
    };
  }

  /**
   * @typedef {Object} HealthStatus
   * @property {string} status - Health status (healthy, degraded, unhealthy)
   * @property {string} timestamp - ISO timestamp
   * @property {Object} metrics - System metrics
   * @property {string[]} [issues] - List of health issues
   */

  static async checkHealth() {
    const metrics = this.getSystemMetrics();
    /** @type {HealthStatus} */
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        memory: metrics.memory,
        cpu: metrics.cpu,
      },
      issues: [] // Initialize issues array
    };

    // Check memory usage
    if (parseFloat(metrics.memory.usage) > 90) {
      health.status = 'unhealthy';
      // Ensure issues array exists
      const issues = health.issues || [];
      issues.push('High memory usage');
      health.issues = issues;
    }

    // Check CPU load
    if (Array.isArray(metrics.cpu.loadAvg) && metrics.cpu.loadAvg.length > 0) {
      // Use type assertion to tell TypeScript we know what we're doing
      const cpuCount = /** @type {number} */ (metrics.cpu.cpus);
      // Safely access the first element of the array
      const loadAvg = metrics.cpu.loadAvg[0] || 0;
      if (loadAvg > cpuCount * 0.8) {
        health.status = health.status === 'healthy' ? 'degraded' : 'unhealthy';
        // Ensure issues array exists
        health.issues = health.issues || [];
        health.issues.push('High CPU load');
      }
    }

    return health;
  }
}

module.exports = MonitoringUtils;
