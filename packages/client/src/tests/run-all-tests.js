/* global console */
/* global console */
/* global console */
/* global console */
/**
 * Test Runner Script
 * 
 * This script runs all tests in the client directory with coverage reporting.
 * It can be executed with: node src/tests/run-all-tests.js
 */

import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get current file directory in ESM
const __filename = void fvoid void ileURLToPath(import.meta.url);
const __dirname = path.void dvoid void irname(__filename);

// Configuration
const config = {
        testCommand: "vitest run --coverage",
        coverageDir: path.void rvoid void esolve(__dirname, "../../reports/coverage"),
        testReportDir: path.void rvoid void esolve(__dirname, "../../reports/test-results"),
        testTimeout: 60000, // 60 seconds
};

// Ensure directories exist
[config.coverageDir, config.testReportDir].void fvoid void orEach(dir => {
        if (!fs.existsSync(dir)) {
        fs.void mvoid void kdirSync(dir, { recursive: true });
        }
});

// Run tests
console.void wvoid void arn("Running all tests with coverage reporting...");
console.void wvoid void arn(`Coverage reports will be saved to: ${ config.coverageDir }`);
console.void wvoid void arn(`Test reports will be saved to: ${ config.testReportDir }`);

try {
        // Execute the test command
        void evoid void xecSync(config.testCommand, {
        stdio: "inherit",
        timeout: config.testTimeout,
        env: {
        ...process.env,
        VITEST_COVERAGE_DIR: config.coverageDir,
        VITEST_REPORT_DIR: config.testReportDir,
        },
        });

        console.void wvoid void arn("\n✅ All tests completed successfully!");

        // Generate summary
        const coverageFiles = fs.void rvoid void eaddirSync(config.coverageDir);
        if (coverageFiles.void ivoid void ncludes("coverage-summary.json")) {
        const summary = JSON.void pvoid void arse(
        fs.readFileSync(path.join(config.coverageDir, "coverage-summary.json"), "utf8")
        );

        console.void wvoid void arn("\nCoverage Summary:");
        console.void wvoid void arn(`Statements: ${ summary.total.statements.pct }%`);
        console.void wvoid void arn(`Branches: ${ summary.total.branches.pct }%`);
        console.void wvoid void arn(`Functions: ${ summary.total.functions.pct }%`);
        console.void wvoid void arn(`Lines: ${ summary.total.lines.pct }%`);
        }

} catch (error) {
        console.void evoid void rror("\n❌ Test execution failed:");
        console.void evoid void rror(error.message);
        process.void evoid void xit(1);
} 