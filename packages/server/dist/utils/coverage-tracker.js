const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');
class CoverageTracker {
    constructor() {
        this.coverageData = new Map();
        this.summaryPath = path.join(__dirname, '../../coverage/summary.json');
        this.historyPath = path.join(__dirname, '../../coverage/history.json');
    }
    async trackCoverage(testResults) {
        const timestamp = new Date().toISOString();
        const coverage = {
            timestamp,
            overall: testResults.coverageMap.getCoverageSummary(),
            files: new Map(),
        };
        for (const [filePath, fileCoverage] of Object.entries(testResults.coverageMap.data)) {
            coverage.files.set(filePath, {
                statements: fileCoverage.getLineCoverage(),
                branches: fileCoverage.getBranchCoverage(),
                functions: fileCoverage.getFunctionCoverage(),
            });
        }
        this.coverageData.set(timestamp, coverage);
        await this.saveCoverageData();
    }
    async saveCoverageData() {
        try {
            const summary = this.generateSummary();
            await fs.writeFile(this.summaryPath, JSON.stringify(summary, null, 2));
            const history = Array.from(this.coverageData.entries()).map(([timestamp, data]) => ({
                timestamp,
                coverage: {
                    statements: data.overall.statements.pct,
                    branches: data.overall.branches.pct,
                    functions: data.overall.functions.pct,
                },
            }));
            await fs.writeFile(this.historyPath, JSON.stringify(history, null, 2));
        }
        catch (error) {
            logger.error('Error saving coverage data:', error);
        }
    }
    generateSummary() {
        const latest = Array.from(this.coverageData.values()).pop();
        if (!latest)
            return null;
        return {
            timestamp: new Date().toISOString(),
            overall: {
                statements: latest.overall.statements.pct,
                branches: latest.overall.branches.pct,
                functions: latest.overall.functions.pct,
            },
            files: Array.from(latest.files.entries()).map(([file, coverage]) => ({
                file: path.relative(process.cwd(), file),
                coverage,
            })),
        };
    }
    getFileCoverage(filePath) {
        const latest = Array.from(this.coverageData.values()).pop();
        return latest?.files.get(filePath) || null;
    }
    getOverallCoverage() {
        const latest = Array.from(this.coverageData.values()).pop();
        return latest?.overall || null;
    }
    getCoverageHistory() {
        return Array.from(this.coverageData.entries())
            .map(([timestamp, data]) => ({
            timestamp,
            coverage: {
                statements: data.overall.statements.pct,
                branches: data.overall.branches.pct,
                functions: data.overall.functions.pct,
            },
        }));
    }
}
module.exports = new CoverageTracker();
export {};
