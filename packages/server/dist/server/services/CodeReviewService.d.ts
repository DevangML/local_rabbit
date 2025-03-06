export = CodeReviewService;
declare class CodeReviewService {
    apiKey: string | undefined;
    baseUrl: string;
    maxRetries: number;
    maxTokensPerRequest: number;
    /**
     * Review code changes in a pull request
     * @param {string} repoPath - Path to the repository
     * @param {string} baseBranch - Base branch (e.g., main)
     * @param {string} headBranch - Head branch (feature branch)
     * @returns {Promise<Object>} - Review results
     */
    reviewPullRequest(repoPath: string, baseBranch: string, headBranch: string): Promise<Object>;
    /**
     * Get diff between two branches
     * @param {string} repoPath - Repository path
     * @param {string} baseBranch - Base branch
     * @param {string} headBranch - Head branch
     * @returns {Promise<string>} - Git diff output
     */
    getDiffBetweenBranches(repoPath: string, baseBranch: string, headBranch: string): Promise<string>;
    /**
     * Parse git diff output into structured file objects
     * @param {string} diffOutput - Git diff output
     * @returns {Promise<Array>} - Array of file objects
     */
    parseGitDiff(diffOutput: string): Promise<any[]>;
    /**
     * Get file type based on extension
     * @param {string} extension - File extension
     * @returns {string} - File type
     */
    getFileType(extension: string): string;
    /**
     * Analyze files with token optimization
     * @param {Array} files - Array of file objects
     * @returns {Promise<Array>} - Analysis results for each file
     */
    analyzeFilesWithTokenOptimization(files: any[]): Promise<any[]>;
    /**
     * Group files by their type for more focused analysis
     * @param {Array} files - Array of file objects
     * @returns {Object} - Files grouped by type
     */
    groupFilesByType(files: any[]): Object;
    /**
     * Chunk files based on estimated token size to optimize API calls
     * @param {Array} files - Array of file objects
     * @returns {Array} - Array of file chunks
     */
    chunkFilesByTokenSize(files: any[]): any[];
    /**
     * Get AI review for a chunk of files
     * @param {Array} files - Array of file objects
     * @param {string} fileType - Type of files being reviewed
     * @returns {Promise<Array>} - Review results
     */
    getAIReviewForChunk(files: any[], fileType: string): Promise<any[]>;
    /**
     * Create type-specific prompt for better analysis
     * @param {Array} files - Array of file objects
     * @param {string} fileType - Type of files being reviewed
     * @returns {string} - Enhanced prompt
     */
    createTypeSpecificPrompt(files: any[], fileType: string): string;
    /**
     * Call the Gemini API
     * @param {string} prompt - Enhanced prompt
     * @returns {Promise<Object>} - Raw API response
     */
    callGeminiAPI(prompt: string): Promise<Object>;
    /**
     * Parse the review response from Gemini API
     * @param {Object} response - Raw API response
     * @param {Array} originalFiles - Original files that were analyzed
     * @returns {Array} - Parsed file reviews
     */
    parseReviewResponse(response: Object, originalFiles: any[]): any[];
    /**
     * Match reviews to original files
     * @param {Array} fileReviews - Reviews returned by Gemini
     * @param {Array} originalFiles - Original files that were analyzed
     * @returns {Array} - Complete file reviews
     */
    matchReviewsToOriginalFiles(fileReviews: any[], originalFiles: any[]): any[];
    /**
     * Generate a summary of all file reviews
     * @param {Array} fileReviews - Reviews for all files
     * @returns {Object} - Summary object
     */
    generateSummary(fileReviews: any[]): Object;
}
//# sourceMappingURL=CodeReviewService.d.ts.map