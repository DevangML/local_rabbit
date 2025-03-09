export = SecureGitService;
declare class SecureGitService {
    /**
     * Find Git repositories in common directories
     * @returns {Promise<Array<{path: string, name: string}>>} - Array of repository objects
     */
    static findRepositories(): Promise<Array<{
        path: string;
        name: string;
    }>>;
    /**
     * Recursively search directory for Git repositories
     * @param {string} dir - Directory to search
     * @param {Array<{path: string, name: string}>} repos - Array to store found repositories
     * @param {number} [depth=0] - Current search depth
     */
    static searchDirectory(dir: string, repos: Array<{
        path: string;
        name: string;
    }>, depth?: number): Promise<void>;
    currentRepoPath: string;
    allowedDirectories: string[];
    /**
     * Set the current repository path
     * @param {string} repoPath - Path to the repository
     * @returns {boolean} - Whether the path was set successfully
     */
    setRepositoryPath(repoPath: string): boolean;
    getRepositoryPath(): string;
    /**
     * Check if a path is allowed
     * @param {string} pathToCheck - Path to check
     * @returns {boolean} - Whether the path is allowed
     */
    isPathAllowed(pathToCheck: string): boolean;
    /**
     * Check if a path is a valid Git repository
     * @param {string} repoPath - Path to check
     * @returns {Promise<boolean>} - Whether the path is a valid Git repository
     */
    isValidRepo(repoPath: string): Promise<boolean>;
    getBranches(): Promise<any>;
    /**
     * Get diff between two branches
     * @param {string} fromBranch - Source branch
     * @param {string} toBranch - Target branch
     * @returns {Promise<Array<{status: string, file: string}>>} - List of changed files with status
     */
    getDiff(fromBranch: string, toBranch: string): Promise<Array<{
        status: string;
        file: string;
    }>>;
}
import path = require("path");
