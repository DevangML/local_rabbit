export = GitService;
declare class GitService {
    /**
     * Find Git repositories in common directories
     * @returns {Promise<Array>} - Array of repository objects
     */
    static findRepositories(): Promise<any[]>;
    constructor(repoPath?: string);
    repoPath: string;
    git: any;
    stateFilePath: string;
    /**
     * Set the repository path
     * @param {string} repoPath - Path to the repository
     */
    setRepoPath(repoPath: string): void;
    /**
     * Check if the current path is a valid Git repository
     * @returns {Promise<boolean>} - True if valid Git repository
     */
    isValidRepo(): Promise<boolean>;
    /**
     * Get all branches in the repository
     * @returns {Promise<Object>} - Object containing branch information
     */
    getBranches(): Promise<Object>;
    /**
     * Get the current branch
     * @returns {Promise<string>} - Current branch name
     */
    getCurrentBranch(): Promise<string>;
    /**
     * Get diff between two branches
     * @param {string} fromBranch - Source branch
     * @param {string} toBranch - Target branch
     * @returns {Promise<string>} - Diff output
     */
    getDiff(fromBranch: string, toBranch: string): Promise<string>;
    /**
     * Load repository path from state file
     * @returns {Promise<string>} - Repository path
     */
    loadState(): Promise<string>;
    /**
     * Save repository path to state file
     * @returns {Promise<void>}
     */
    saveState(): Promise<void>;
    /**
     * Check if the given path is a valid Git repository
     * @param {string} dirPath - Path to the directory
     * @returns {Promise<boolean>} - True if valid Git repository
     */
    isGitRepository(dirPath: string): Promise<boolean>;
    /**
     * Get the content of a file at a specific commit or branch
     * @param {string} filePath - Path to the file
     * @param {string} ref - Commit hash or branch name
     * @returns {Promise<string>} - File content
     */
    getFileContent(filePath: string, ref: string): Promise<string>;
    /**
     * Get the commit history of a branch
     * @param {string} branch - Branch name
     * @param {number} [maxCount=100] - Maximum number of commits to retrieve
     * @returns {Promise<Object>} - Commit history
     */
    getCommitHistory(branch: string, maxCount?: number): Promise<Object>;
    /**
     * Get the status of the repository
     * @returns {Promise<Object>} - Repository status
     */
    getStatus(): Promise<Object>;
}
//# sourceMappingURL=GitService.d.ts.map