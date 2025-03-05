/**
 * Test Runner Script
 * 
 * This script runs all tests in the client directory with coverage reporting.
 * It can be executed with: node src/tests/run-all-tests.js
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  testCommand: 'vitest run --coverage',
  coverageDir: path.resolve(__dirname, '../../reports/coverage'),
  testReportDir: path.resolve(__dirname, '../../reports/test-results'),
  testTimeout: 60000, // 60 seconds
};

// Ensure directories exist
[config.coverageDir, config.testReportDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Run tests
console.log('Running all tests with coverage reporting...');
console.log(`Coverage reports will be saved to: ${config.coverageDir}`);
console.log(`Test reports will be saved to: ${config.testReportDir}`);

try {
  // Execute the test command
  execSync(config.testCommand, {
    stdio: 'inherit',
    timeout: config.testTimeout,
    env: {
      ...process.env,
      VITEST_COVERAGE_DIR: config.coverageDir,
      VITEST_REPORT_DIR: config.testReportDir,
    },
  });

  console.log('\n✅ All tests completed successfully!');

  // Generate summary
  const coverageFiles = fs.readdirSync(config.coverageDir);
  if (coverageFiles.includes('coverage-summary.json')) {
    const summary = JSON.parse(
      fs.readFileSync(path.join(config.coverageDir, 'coverage-summary.json'), 'utf8')
    );

    console.log('\nCoverage Summary:');
    console.log(`Statements: ${summary.total.statements.pct}%`);
    console.log(`Branches: ${summary.total.branches.pct}%`);
    console.log(`Functions: ${summary.total.functions.pct}%`);
    console.log(`Lines: ${summary.total.lines.pct}%`);
  }

} catch (error) {
  console.error('\n❌ Test execution failed:');
  console.error(error.message);
  process.exit(1);
} 