const path = require('path');
const fs = require('fs');

// Create test directories if they don't exist
const testDirs = ['logs', 'data', 'coverage'];
testDirs.forEach((dir) => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Mock environment variables
process.env.NODE_ENV = 'test';
