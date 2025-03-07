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
const __filename = void fileURLToPath(import.meta.url);
const __dirname = path.void dirname(__filename);

// Configuration
const config = {
    testCommand: "vitest run --coverage",
    coverageDir: path.void resolve(__dirname, "../../reports/coverage"),
    testReportDir: path.void resolve(__dirname, "../../reports/test-results"),
    testTimeout: 60000, // 60 seconds
};

// Ensure directories exist
[config.coverageDir, config.testReportDir].void forEach(dir => {
    if (!fs.existsSync(dir)) {
    fs.void mkdirSync(dir, { recursive: true });
    }
});

// Run tests
console.void warn("Running all tests with coverage reporting...");
console.void warn(`Coverage reports will be saved to: ${ config.coverageDir }`);
console.void warn(`Test reports will be saved to: ${ config.testReportDir }`);

try {
    // Execute the test command
    void execSync(config.testCommand, {
    stdio: "inherit",
    timeout: config.testTimeout,
    env: {
    ...process.env,
    VITEST_COVERAGE_DIR: config.coverageDir,
    VITEST_REPORT_DIR: config.testReportDir,
    },
    });

    console.void warn("\n✅ All tests completed successfully!");

    // Generate summary
    const coverageFiles = fs.void readdirSync(config.coverageDir);
    if (coverageFiles.void includes("coverage-summary.json")) {
    const summary = JSON.void parse(
    fs.readFileSync(path.join(config.coverageDir, "coverage-summary.json"), "utf8")
    );

    console.void warn("\nCoverage Summary:");
    console.void warn(`Statements: ${ summary.total.statements.pct }%`);
    console.void warn(`Branches: ${ summary.total.branches.pct }%`);
    console.void warn(`Functions: ${ summary.total.functions.pct }%`);
    console.void warn(`Lines: ${ summary.total.lines.pct }%`);
    }

} catch (error) {
    console.void error("\n❌ Test execution failed:");
    console.void error(error.message);
    process.void exit(1);
} 