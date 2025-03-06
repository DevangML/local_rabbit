const os = require('os');
const logger = require('./logger');
class MonitoringUtils {
    static getSystemMetrics() {
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
    static logSystemMetrics(interval = 300000) {
        const logMetrics = () => {
            const metrics = this.getSystemMetrics();
            logger.info('System Metrics:', metrics);
            // Alert on high memory usage
            if (metrics.memory.usage > 90) {
                logger.warn('High memory usage detected:', metrics.memory);
            }
            // Alert on high CPU load
            if (metrics.cpu.loadAvg[0] > metrics.cpu.cpus * 0.8) {
                logger.warn('High CPU load detected:', metrics.cpu);
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
    static async checkHealth() {
        const metrics = this.getSystemMetrics();
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            metrics: {
                memory: metrics.memory,
                cpu: metrics.cpu,
            },
        };
        // Check memory usage
        if (metrics.memory.usage > 90) {
            health.status = 'unhealthy';
            health.issues = ['High memory usage'];
        }
        // Check CPU load
        if (metrics.cpu.loadAvg[0] > metrics.cpu.cpus * 0.8) {
            health.status = health.status === 'healthy' ? 'degraded' : 'unhealthy';
            health.issues = health.issues || [];
            health.issues.push('High CPU load');
        }
        return health;
    }
}
module.exports = MonitoringUtils;
export {};
