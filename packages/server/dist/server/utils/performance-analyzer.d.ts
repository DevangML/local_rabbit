export = PerformanceAnalyzer;
declare class PerformanceAnalyzer {
    measurements: Map<any, any>;
    measure(operation: any, fn: any): Promise<{
        result: any;
        duration: number;
    }>;
    measureSync(operation: any, fn: any): {
        result: any;
        duration: number;
    };
    recordMeasurement(operation: any, duration: any): void;
    getMetrics(operation: any): {
        count: any;
        totalTime: number;
        avgTime: number;
        min: number;
        max: number;
        p95: number;
        p99: number;
    } | null;
    getStats(): {};
    reset(operation: any): void;
}
declare namespace PerformanceAnalyzer {
    export { runTest, compareImplementations, runAllTests };
}
/**
 * Run a performance test
 * @param {string} name - Test name
 * @param {Function} fn - Function to test
 * @param {number} iterations - Number of iterations
 * @returns {Object} Test results
 */
declare function runTest(name: string, fn: Function, iterations?: number): Object;
/**
 * Compare standard vs optimized implementations
 * @param {string} testName - Test name
 * @param {Function} standardFn - Standard implementation
 * @param {Function} optimizedFn - Optimized implementation
 * @param {number} iterations - Number of iterations
 */
declare function compareImplementations(testName: string, standardFn: Function, optimizedFn: Function, iterations?: number): Promise<{
    testName: string;
    standardResult: Object;
    optimizedResult: Object;
    improvement: number;
}>;
declare function runAllTests(): Promise<void>;
//# sourceMappingURL=performance-analyzer.d.ts.map