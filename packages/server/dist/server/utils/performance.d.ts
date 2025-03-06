/**
 * Memoize a function with optional TTL (time to live)
 * @param {Function} fn - Function to memoize
 * @param {Object} options - Options object
 * @param {number} [options.maxAge=60000] - Cache TTL in milliseconds (default: 1 minute)
 * @param {number} [options.maxSize=100] - Maximum cache size
 * @param {Function} [options.resolver] - Custom cache key resolver
 * @returns {Function} Memoized function
 */
export function memoizeWithTTL(fn: Function, options?: {
    maxAge?: number | undefined;
    maxSize?: number | undefined;
    resolver?: Function | undefined;
}): Function;
/**
 * Run tasks in parallel with concurrency control
 * @param {Array} items - Array of items to process
 * @param {Function} task - Task function that returns a promise
 * @param {Object} options - Options object
 * @param {number} [options.concurrency=5] - Maximum number of concurrent tasks
 * @param {boolean} [options.stopOnError=false] - Whether to stop on first error
 * @returns {Promise<Array>} Results array
 */
export function parallelizeTask(items: any[], task: Function, options?: {
    concurrency?: number | undefined;
    stopOnError?: boolean | undefined;
}): Promise<any[]>;
/**
 * Throttle a function to limit its execution rate
 * @param {Function} fn - Function to throttle
 * @param {number} [wait=1000] - Throttle wait time in milliseconds
 * @returns {Function} Throttled function
 */
export function throttleFunction(fn: Function, wait?: number): Function;
/**
 * Debounce a function to delay its execution
 * @param {Function} fn - Function to debounce
 * @param {number} [wait=300] - Debounce wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounceFunction(fn: Function, wait?: number): Function;
/**
 * Batch process an array of items
 * @param {Array} items - Array of items to process
 * @param {Function} processFn - Function to process each batch
 * @param {number} [batchSize=100] - Size of each batch
 * @returns {Promise<Array>} Combined results
 */
export function batchProcess(items: any[], processFn: Function, batchSize?: number): Promise<any[]>;
export { _, async };
//# sourceMappingURL=performance.d.ts.map