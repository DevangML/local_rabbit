export = requestLogger;
/**
 * Middleware to log HTTP requests and responses
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
declare function requestLogger(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction): void;
