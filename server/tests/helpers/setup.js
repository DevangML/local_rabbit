const path = require('path');
const fs = require('fs-extra');

const setupTestEnv = async () => {
  // Ensure test directories exist
  const testDirs = [
    'coverage',
    'coverage/lcov-report',
    'logs',
    'tests/fixtures',
  ];

  for (const dir of testDirs) {
    await fs.ensureDir(path.join(__dirname, '../../', dir));
  }

  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
};

module.exports = setupTestEnv;
