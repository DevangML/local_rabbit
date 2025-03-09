export = ValidationUtils;
declare class ValidationUtils {
    /**
     * Validates if a file path is valid
     * @param {string} filePath - The file path to validate
     * @returns {boolean} - Whether the path is valid
     */
    static isValidPath(filePath: string): boolean;
    /**
     * Validates if a branch name is valid
     * @param {string} branchName - The branch name to validate
     * @returns {boolean} - Whether the branch name is valid
     */
    static isValidBranchName(branchName: string): boolean;
    /**
     * Sanitizes a file path
     * @param {string} filePath - The file path to sanitize
     * @returns {string} - The sanitized path
     */
    static sanitizePath(filePath: string): string;
    /**
     * Validates a repository request
     * @param {Request} req - The request object
     * @returns {string[]} - Array of error messages
     */
    static validateRepositoryRequest(req: Request): string[];
    /**
     * Validates a diff request
     * @param {Request} req - The request object
     * @returns {string[]} - Array of error messages
     */
    static validateDiffRequest(req: Request): string[];
    /**
     * Validates if a git operation is valid
     * @param {string} operation - The git operation to validate
     * @returns {boolean} - Whether the operation is valid
     */
    static isValidGitOperation(operation: string): boolean;
}
declare namespace ValidationUtils {
    export { GitConfig, RequestBody, Request };
}
type GitConfig = {
    /**
     * - Path to the git state file
     */
    statePath: string;
    /**
     * - Default branch name
     */
    defaultBranch: string;
    /**
     * - Maximum diff size
     */
    maxDiffSize: number;
    /**
     * - Allowed directories for git operations
     */
    allowedDirs?: string[];
};
type RequestBody = {
    /**
     * - Repository path
     */
    path?: string;
    /**
     * - Source branch name
     */
    fromBranch?: string;
    /**
     * - Target branch name
     */
    toBranch?: string;
};
type Request = {
    /**
     * - Request body
     */
    body: RequestBody;
};
