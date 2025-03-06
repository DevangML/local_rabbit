export = MonitoringUtils;
declare class MonitoringUtils {
    static getSystemMetrics(): {
        timestamp: string;
        memory: {
            total: number;
            free: number;
            used: number;
            usage: string;
        };
        cpu: {
            loadAvg: number[];
            cpus: number;
        };
        uptime: number;
    };
    static logSystemMetrics(interval?: number): NodeJS.Timeout;
    static getProcessMetrics(): {
        heapTotal: number;
        heapUsed: number;
        rss: number;
        external: number;
        uptime: number;
    };
    static checkHealth(): Promise<{
        status: string;
        timestamp: string;
        metrics: {
            memory: {
                total: number;
                free: number;
                used: number;
                usage: string;
            };
            cpu: {
                loadAvg: number[];
                cpus: number;
            };
        };
    }>;
}
//# sourceMappingURL=monitoring.d.ts.map