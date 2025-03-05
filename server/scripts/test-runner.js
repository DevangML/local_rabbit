const jest = require('jest');
const path = require('path');
const setupTestEnv = require('../tests/helpers/setup');
const logger = require('../src/utils/logger');

async function runTests() {
  try {
    // Setup test environment
    await setupTestEnv();

    const config = {
      rootDir: path.join(__dirname, '..'),
      coverage: true,
      verbose: true,
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/helpers/setup.js'],
      collectCoverageFrom: [
        'src/**/*.js',
        '!src/**/*.test.js',
        '!src/config/**',
        '!**/node_modules/**',
      ],
      coverageReporters: ['json', 'lcov', 'text', 'json-summary'],
      testMatch: [
        '**/tests/**/*.test.js',
        '**/src/**/*.test.js',
      ],
    };

    const results = await jest.runCLI(config, [config.rootDir]);

    if (!results.results.success) {
      logger.error('Tests failed');
      process.exit(1);
    }

    logger.success('Tests completed successfully');
  } catch (error) {
    logger.error('Error running tests:', error);
    process.exit(1);
  }
}

runTests();
