declare const _exports: CoverageTracker;
export = _exports;
declare class CoverageTracker {
    coverageData: Map<any, any>;
    summaryPath: string;
    historyPath: string;
    trackCoverage(testResults: any): Promise<void>;
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
    getFileCoverage(filePath: any): any;
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
//# sourceMappingURL=coverage-tracker.d.ts.map