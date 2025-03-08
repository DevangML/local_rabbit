declare const _exports: CoverageTracker;
export = _exports;
declare class CoverageTracker {
    coverageData: Map<any, any>;
    summaryPath: string;
    historyPath: string;
    /**
     * Track test coverage results
     * @param {Object} testResults - Test results containing coverage data
     * @param {Object} testResults.coverageMap - Coverage map with data property
     * @param {Function} testResults.coverageMap.getCoverageSummary - Method to get coverage summary
     * @param {Object} testResults.coverageMap.data - Coverage data by file path
     * @returns {Promise<void>}
     */
    trackCoverage(testResults: {
        coverageMap: {
            getCoverageSummary: Function;
            data: Object;
        };
    }): Promise<void>;
    saveCoverageData(): Promise<void>;
    generateSummary(): {
        timestamp: string;
        overall: {
            statements: any;
            branches: any;
            functions: any;
        };
        files: {
            file: string;
            coverage: any;
        }[];
    } | null;
    /**
     * Get coverage data for a specific file
     * @param {string} filePath - Path to the file
     * @returns {Object|null} - Coverage data for the file or null if not found
     */
    getFileCoverage(filePath: string): Object | null;
    getOverallCoverage(): any;
    getCoverageHistory(): {
        timestamp: any;
        coverage: {
            statements: any;
            branches: any;
            functions: any;
        };
    }[];
}
