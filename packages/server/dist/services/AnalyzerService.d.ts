export = AnalyzerService;
/**
 * @typedef {Object} FileChange
 * @property {string} name - File name
 * @property {string} extension - File extension
 * @property {number} additions - Number of added lines
 * @property {number} deletions - Number of deleted lines
 * @property {string[]} changes - Array of change lines
 * @property {string} path - File path
 * @property {{impactLevel?: 'high' | 'medium' | 'low' | 'unknown'}} [analysis] - Analysis results
 */
/**
 * @typedef {Object} ComplexityResult
 * @property {number} score - Complexity score
 * @property {number} changes - Number of changes
 */
/**
 * @typedef {Object} GeminiService
 * @property {Function} analyzeDiff - Method to analyze diff using AI
 */
declare class AnalyzerService {
    static COMPLEXITY_THRESHOLDS: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
    };
    /**
     * Parse git diff output into structured file objects
     * @param {string} diffOutput - Git diff output
     * @returns {FileChange[]} - Array of file objects
     */
    static parseDiff(diffOutput: string): FileChange[];
    /**
     * Get file type based on extension
     * @param {string} extension - File extension
     * @returns {string} - File type
     */
    static getFileType(extension: string): string;
    /**
     * Calculate complexity metrics for a file
     * @param {FileChange} file - File object
     * @returns {ComplexityResult} - Complexity metrics
     */
    static calculateComplexity(file: FileChange): ComplexityResult;
    /**
     * Calculate impact level based on complexity
     * @param {FileChange} file - File object
     * @param {ComplexityResult} complexity - Complexity metrics
     * @returns {string} - Impact level (high, medium, low)
     */
    static calculateImpactLevel(file: FileChange, complexity: ComplexityResult): string;
    /**
     * Generate a summary of the analyzed diff
     * @param {FileChange[]} files - Array of analyzed file objects
     * @returns {Object} - Summary object
     */
    static generateSummary(files: FileChange[]): Object;
    /**
     * Create a new AnalyzerService instance
     * @param {string} repoPath - Path to the repository
     * @param {GeminiService|null} geminiService - Service for AI-powered analysis
     */
    constructor(repoPath?: string, geminiService?: GeminiService | null);
    repoPath: string;
    geminiService: GeminiService | null;
    /**
     * Set the repository path
     * @param {string} repoPath - Path to the repository
     */
    setRepoPath(repoPath: string): void;
    /**
     * Analyze a diff output
     * @param {string} diffOutput - Git diff output
     * @param {string} prompt - Custom prompt for analysis
     * @returns {Promise<Object>} - Analyzed diff data
     */
    analyzeDiff(diffOutput: string, prompt?: string): Promise<Object>;
    /**
     * Analyze a file's changes
     * @param {FileChange} file - File object
     * @returns {Promise<Object>} - Analysis results
     */
    analyzeFile(file: FileChange): Promise<Object>;
}
declare namespace AnalyzerService {
    export { FileChange, ComplexityResult, GeminiService };
}
type FileChange = {
    /**
     * - File name
     */
    name: string;
    /**
     * - File extension
     */
    extension: string;
    /**
     * - Number of added lines
     */
    additions: number;
    /**
     * - Number of deleted lines
     */
    deletions: number;
    /**
     * - Array of change lines
     */
    changes: string[];
    /**
     * - File path
     */
    path: string;
    /**
     * - Analysis results
     */
    analysis?: {
        impactLevel?: "high" | "medium" | "low" | "unknown" | undefined;
    } | undefined;
};
type ComplexityResult = {
    /**
     * - Complexity score
     */
    score: number;
    /**
     * - Number of changes
     */
    changes: number;
};
type GeminiService = {
    /**
     * - Method to analyze diff using AI
     */
    analyzeDiff: Function;
};
