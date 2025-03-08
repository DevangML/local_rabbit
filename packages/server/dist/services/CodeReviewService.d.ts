export = CodeReviewService;
/**
 * @typedef {Object} FileDiffHunk
 * @property {number} index - The index of the hunk
 * @property {string} content - The content of the hunk
 */
/**
 * @typedef {{[key: string]: string}} FileTypeMap
 */
/**
 * @typedef {Object} ReviewIssue
 * @property {string} message - The issue message
 * @property {'high'|'medium'|'low'} severity - The severity of the issue
 * @property {number} [line] - Optional line number
 * @property {number} [column] - Optional column number
 * @property {string} [code] - Optional code snippet
 * @property {string} [file] - Optional file path
 */
/**
 * @typedef {Object} FileReviewData
 * @property {string} path - The file path
 * @property {string} type - The file type
 * @property {FileDiffHunk[]} [hunks] - The diff hunks
 * @property {string} [content] - The file content
 * @property {ReviewIssue[]} [issues] - The issues found
 * @property {string[]} [suggestions] - The suggestions
 * @property {string} [review] - The review content
 */
/**
 * @typedef {Object} IssuesBySeverity
 * @property {number} high - Number of high severity issues
 * @property {number} medium - Number of medium severity issues
 * @property {number} low - Number of low severity issues
 */
/**
 * @typedef {{[fileType: string]: FileReviewData[]}} FilesByType
 */
/**
 * @typedef {{[filePath: string]: FileReviewData}} ReviewsByPath
 */
/**
 * @typedef {Object} ReviewSummary
 * @property {Object} issueCount - Issue count by severity
 * @property {number} issueCount.high - Number of high severity issues
 * @property {number} issueCount.medium - Number of medium severity issues
 * @property {number} issueCount.low - Number of low severity issues
 * @property {number} issueCount.total - Total number of issues
 * @property {{[key: string]: number}} fileTypes - File types count
 * @property {ReviewIssue[]} topIssues - Top issues
 */
/**
 * @typedef {Object} GitServiceType
 * @property {function(string, string, string): Promise<string>} getDiffBetweenBranches - Method to get diff between branches
 */
/**
 * @typedef {Object} GeminiResponseType
 * @property {Array<{content: {parts: Array<{text: string}>}}>} candidates - The response candidates
 */
/**
 * @typedef {Object} ReviewResponse
 * @property {Object} summary - The review summary
 * @property {FileReviewData[]} files - The reviewed files
 */
/**
 * CodeReviewService class
 * Responsible for analyzing code differences and providing AI-powered code reviews
 */
declare class CodeReviewService {
    apiKey: string | undefined;
    baseUrl: string;
    maxRetries: number;
    maxTokensPerRequest: number;
    GitService: typeof import("./GitService.js");
    /**
     * Review pull request by analyzing the diff between branches
     * @param {string} repoPath - Path to the repository
     * @param {string} baseBranch - Base branch name
     * @param {string} headBranch - Head branch name
     * @returns {Promise<ReviewResponse>} Review results
     */
    reviewPullRequest(repoPath: string, baseBranch: string, headBranch: string): Promise<ReviewResponse>;
    /**
     * Get diff between two branches
     * @param {string} repoPath - Path to the repository
     * @param {string} baseBranch - Base branch name
     * @param {string} headBranch - Head branch name
     * @returns {Promise<FileReviewData[]>} Parsed diff files
     */
    getDiffBetweenBranches(repoPath: string, baseBranch: string, headBranch: string): Promise<FileReviewData[]>;
    /**
     * Parse the git diff output and transform it into a structured format
     * @param {string} diffOutput - Raw git diff output
     * @returns {Promise<FileReviewData[]>} Parsed file data
     */
    parseGitDiff(diffOutput: string): Promise<FileReviewData[]>;
    /**
     * Get the file type based on the extension
     * @param {string} extension - File extension
     * @returns {string} File type
     */
    getFileType(extension: string): string;
    /**
     * Analyze files with token optimization
     * @param {FileReviewData[]} files - Files to analyze
     * @returns {Promise<FileReviewData[]>} Analyzed files with reviews
     */
    analyzeFilesWithTokenOptimization(files: FileReviewData[]): Promise<FileReviewData[]>;
    /**
     * Group files by their type
     * @param {FileReviewData[]} files - Files to group
     * @returns {FilesByType} Files grouped by type
     */
    groupFilesByType(files: FileReviewData[]): FilesByType;
    /**
     * Chunk files by token size to optimize API calls
     * @param {FileReviewData[]} files - Files to chunk
     * @returns {Array<FileReviewData[]>} Chunked files
     */
    chunkFilesByTokenSize(files: FileReviewData[]): Array<FileReviewData[]>;
    /**
     * Get AI review for a chunk of files
     * @param {FileReviewData[]} files - Files to review
     * @param {string} fileType - Type of the files
     * @returns {Promise<FileReviewData[]>} Reviewed files
     */
    getAIReviewForChunk(files: FileReviewData[], fileType: string): Promise<FileReviewData[]>;
    /**
     * Create type-specific prompt for AI review
     * @param {FileReviewData[]} files - Files to review
     * @param {string} fileType - Type of the files
     * @returns {string} Generated prompt
     */
    createTypeSpecificPrompt(files: FileReviewData[], fileType: string): string;
    /**
     * Call Gemini API with the prompt
     * @param {string} prompt - Generated prompt
     * @returns {Promise<ReviewResponse>} API response
     */
    callGeminiAPI(prompt: string): Promise<ReviewResponse>;
    /**
     * Parse review response from API
     * @param {ReviewResponse} response - API response
     * @param {FileReviewData[]} originalFiles - Original files
     * @returns {FileReviewData[]} Parsed reviews
     */
    parseReviewResponse(response: ReviewResponse, originalFiles: FileReviewData[]): FileReviewData[];
    /**
     * Match reviews to original files
     * @param {FileReviewData[]} fileReviews - File reviews
     * @param {FileReviewData[]} originalFiles - Original files
     * @returns {FileReviewData[]} Matched reviews
     */
    matchReviewsToOriginalFiles(fileReviews: FileReviewData[], originalFiles: FileReviewData[]): FileReviewData[];
    /**
     * Generate summary from file reviews
     * @param {FileReviewData[]} fileReviews - File reviews
     * @returns {ReviewSummary} Generated summary
     */
    generateSummary(fileReviews: FileReviewData[]): ReviewSummary;
}
declare namespace CodeReviewService {
    export { FileDiffHunk, FileTypeMap, ReviewIssue, FileReviewData, IssuesBySeverity, FilesByType, ReviewsByPath, ReviewSummary, GitServiceType, GeminiResponseType, ReviewResponse };
}
type FileDiffHunk = {
    /**
     * - The index of the hunk
     */
    index: number;
    /**
     * - The content of the hunk
     */
    content: string;
};
type FileTypeMap = {
    [key: string]: string;
};
type ReviewIssue = {
    /**
     * - The issue message
     */
    message: string;
    /**
     * - The severity of the issue
     */
    severity: 'high' | 'medium' | 'low';
    /**
     * - Optional line number
     */
    line?: number | undefined;
    /**
     * - Optional column number
     */
    column?: number | undefined;
    /**
     * - Optional code snippet
     */
    code?: string | undefined;
    /**
     * - Optional file path
     */
    file?: string | undefined;
};
type FileReviewData = {
    /**
     * - The file path
     */
    path: string;
    /**
     * - The file type
     */
    type: string;
    /**
     * - The diff hunks
     */
    hunks?: FileDiffHunk[] | undefined;
    /**
     * - The file content
     */
    content?: string | undefined;
    /**
     * - The issues found
     */
    issues?: ReviewIssue[] | undefined;
    /**
     * - The suggestions
     */
    suggestions?: string[] | undefined;
    /**
     * - The review content
     */
    review?: string | undefined;
};
type IssuesBySeverity = {
    /**
     * - Number of high severity issues
     */
    high: number;
    /**
     * - Number of medium severity issues
     */
    medium: number;
    /**
     * - Number of low severity issues
     */
    low: number;
};
type FilesByType = {
    [fileType: string]: FileReviewData[];
};
type ReviewsByPath = {
    [filePath: string]: FileReviewData;
};
type ReviewSummary = {
    /**
     * - Issue count by severity
     */
    issueCount: {
        high: number;
        medium: number;
        low: number;
        total: number;
    };
    /**
     * - File types count
     */
    fileTypes: {
        [key: string]: number;
    };
    /**
     * - Top issues
     */
    topIssues: ReviewIssue[];
};
type GitServiceType = {
    /**
     * - Method to get diff between branches
     */
    getDiffBetweenBranches: (arg0: string, arg1: string, arg2: string) => Promise<string>;
};
type GeminiResponseType = {
    /**
     * - The response candidates
     */
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
        };
    }>;
};
type ReviewResponse = {
    /**
     * - The review summary
     */
    summary: Object;
    /**
     * - The reviewed files
     */
    files: FileReviewData[];
};
