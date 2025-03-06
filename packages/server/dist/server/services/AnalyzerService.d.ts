export = AnalyzerService;
declare class AnalyzerService {
    static COMPLEXITY_THRESHOLDS: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
    };
    /**
     * Parse git diff output into structured file objects
     * @param {string} diffOutput - Git diff output
     * @returns {Array} - Array of file objects
     */
    static parseDiff(diffOutput: string): any[];
    /**
     * Get file type based on extension
     * @param {string} extension - File extension
     * @returns {string} - File type
     */
    static getFileType(extension: string): string;
    /**
     * Calculate complexity metrics for a file
     * @param {Object} file - File object
     * @returns {Object} - Complexity metrics
     */
    static calculateComplexity(file: Object): Object;
    /**
     * Calculate impact level of changes
     * @param {Object} file - File object
     * @param {Object} complexity - Complexity metrics
     * @returns {string} - Impact level
     */
    static calculateImpactLevel(file: Object, complexity: Object): string;
    /**
     * Generate a summary of the analyzed diff
     * @param {Array} files - Array of analyzed file objects
     * @returns {Object} - Summary object
     */
    static generateSummary(files: any[]): Object;
    constructor(repoPath?: string);
    repoPath: string;
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
     * @param {Object} file - File object
     * @returns {Promise<Object>} - Analysis results
     */
    analyzeFile(file: Object): Promise<Object>;
}
//# sourceMappingURL=AnalyzerService.d.ts.map