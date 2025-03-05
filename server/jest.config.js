module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/config/**',
    '!**/node_modules/**',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'json-summary'],
  coverageDirectory: 'coverage',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/src/**/*.test.js',
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 85,
      functions: 85,
      lines: 85,
    },
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  moduleDirectories: ['node_modules', 'src'],
};
