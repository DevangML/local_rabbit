export = PerformanceAnalyzer;
declare class PerformanceAnalyzer {
    measurements: Map<any, any>;
    /**
     * @param {string} operation - The operation name to measure
     * @param {Function} fn - The function to measure
     * @returns {Promise<{result: any, duration: number}>} The result and duration
     */
    measure(operation: string, fn: Function): Promise<{
        result: any;
        duration: number;
    }>;
    /**
     * @param {string} operation - The operation name to measure
     * @param {Function} fn - The function to measure
     * @returns {{result: any, duration: number}} The result and duration
     */
    measureSync(operation: string, fn: Function): {
        result: any;
        duration: number;
    };
    /**
     * @param {string} operation - The operation name
     * @param {bigint} duration - The duration in nanoseconds
     */
    recordMeasurement(operation: string, duration: bigint): void;
    /**
     * @param {string} operation - The operation name
     * @returns {Object|null} The metrics for the operation
     */
    getMetrics(operation: string): Object | null;
    getStats(): Record<string, {
        count: number;
        totalTime: number;
        avgTime: number;
    }>;
    /**
     * @param {string} [operation] - The operation to reset, or all if not specified
     */
    reset(operation?: string | undefined): void;
}
declare namespace PerformanceAnalyzer {
    export { runTest, compareImplementations, runAllTests, PerformanceItem, TestResult };
}
/**
 * @typedef {Object} TestResult
 * @property {string} name - Test name
 * @property {number} duration - Test duration in milliseconds
 * @property {number} iterations - Number of iterations
 * @property {number} opsPerSecond - Operations per second
 * @property {any} result - Result of the test function
 */
/**
 * Run a performance test
 * @param {string} name - Test name
 * @param {Function} fn - Function to test
 * @param {number} iterations - Number of iterations
 * @returns {Promise<TestResult>} Test results
 */
declare function runTest(name: string, fn: Function, iterations?: number): Promise<TestResult>;
/**
 * Compare standard vs optimized implementations
 * @param {string} testName - Test name
 * @param {Function} standardFn - Standard implementation
 * @param {Function} optimizedFn - Optimized implementation
 * @param {number} iterations - Number of iterations
 * @returns {Promise<{testName: string, standardResult: TestResult, optimizedResult: TestResult, improvement: number}>} Comparison results
 */
declare function compareImplementations(testName: string, standardFn: Function, optimizedFn: Function, iterations?: number): Promise<{
    testName: string;
    standardResult: TestResult;
    optimizedResult: TestResult;
    improvement: number;
}>;
declare function runAllTests(): Promise<void>;
type PerformanceItem = {
    /**
     * - The item's value
     */
    value: number;
    /**
     * - Optional score
     */
    score?: number | undefined;
    /**
     * - Optional id
     */
    id?: number | undefined;
    /**
     * - Whether the item is active
     */
    active?: boolean | undefined;
    /**
     * - Any other properties
     */
    rest?: any;
};
type TestResult = {
    /**
     * - Test name
     */
    name: string;
    /**
     * - Test duration in milliseconds
     */
    duration: number;
    /**
     * - Number of iterations
     */
    iterations: number;
    /**
     * - Operations per second
     */
    opsPerSecond: number;
    /**
     * - Result of the test function
     */
    result: any;
};
