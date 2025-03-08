export = MonitoringUtils;
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
declare class MonitoringUtils {
    static getSystemMetrics(): SystemMetrics;
    static logSystemMetrics(interval?: number): NodeJS.Timeout;
    static getProcessMetrics(): {
        heapTotal: number;
        heapUsed: number;
        rss: number;
        external: number;
        uptime: number;
    };
    /**
     * @typedef {Object} HealthStatus
     * @property {string} status - Health status (healthy, degraded, unhealthy)
     * @property {string} timestamp - ISO timestamp
     * @property {Object} metrics - System metrics
     * @property {string[]} [issues] - List of health issues
     */
    static checkHealth(): Promise<{
        /**
         * - Health status (healthy, degraded, unhealthy)
         */
        status: string;
        /**
         * - ISO timestamp
         */
        timestamp: string;
        /**
         * - System metrics
         */
        metrics: Object;
        /**
         * - List of health issues
         */
        issues?: string[] | undefined;
    }>;
}
declare namespace MonitoringUtils {
    export { SystemMetrics };
}
type SystemMetrics = {
    /**
     * - ISO timestamp
     */
    timestamp: string;
    /**
     * - Memory metrics
     */
    memory: {
        total: number;
        free: number;
        used: number;
        usage: string;
    };
    /**
     * - CPU metrics
     */
    cpu: {
        loadAvg: number[];
        cpus: number;
    };
    /**
     * - System uptime
     */
    uptime: number;
    /**
     * - Process metrics
     */
    process?: Object | undefined;
};
