export = errorHandler;
/**
 * @typedef {Object} ExtendedError
 * @property {string} [message] - Error message
 * @property {number} [status] - HTTP status code
 * @property {number} [statusCode] - Alternative HTTP status code
 * @property {string} [stack] - Error stack trace
 * @property {number} [lineNumber] - Line number where error occurred
 * @property {any} [details] - Additional error details
 * @property {any} [cause] - Error cause
 */
/**
 * @param {ExtendedError} err - Error object with additional properties
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} _next - Express next function
 */
declare function errorHandler(err: ExtendedError, req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction): void;
declare namespace errorHandler {
    export { ExtendedError };
}
type ExtendedError = {
    /**
     * - Error message
     */
    message?: string | undefined;
    /**
     * - HTTP status code
     */
    status?: number | undefined;
    /**
     * - Alternative HTTP status code
     */
    statusCode?: number | undefined;
    /**
     * - Error stack trace
     */
    stack?: string | undefined;
    /**
     * - Line number where error occurred
     */
    lineNumber?: number | undefined;
    /**
     * - Additional error details
     */
    details?: any;
    /**
     * - Error cause
     */
    cause?: any;
};
