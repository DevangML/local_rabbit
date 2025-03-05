module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['./tests/setup.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  coverageReporters: [
    'text',
    'lcov',
    'json',
    'html',
    ['text-summary', { file: './coverage/summary.txt' }]
  ],
  verbose: true
};
