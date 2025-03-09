/**
 * Script to start the server with all performance optimizations
 * This script sets the NODE_ENV to production and runs the server
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Print server information
console.log(`${colors.bright}${colors.blue}=== Starting Optimized Express Server ===${colors.reset}`);
console.log(`${colors.cyan}Environment:${colors.reset} ${colors.bright}production${colors.reset}`);
console.log(`${colors.cyan}CPU Cores:${colors.reset} ${colors.bright}${os.cpus().length}${colors.reset}`);
console.log(`${colors.cyan}Memory:${colors.reset} ${colors.bright}${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB${colors.reset}`);
console.log(`${colors.cyan}Platform:${colors.reset} ${colors.bright}${os.platform()} ${os.release()}${colors.reset}`);
console.log(`${colors.cyan}Node Version:${colors.reset} ${colors.bright}${process.version}${colors.reset}`);
console.log(`${colors.cyan}Time:${colors.reset} ${colors.bright}${new Date().toISOString()}${colors.reset}`);
console.log(`${colors.blue}${'='.repeat(40)}${colors.reset}\n`);

// Check if the performance optimizations are implemented
const performanceFilePath = path.join(__dirname, '..', 'src', 'middleware', 'performance.js');
if (!fs.existsSync(performanceFilePath)) {
  console.log(`${colors.yellow}Warning: Performance middleware not found at ${performanceFilePath}${colors.reset}`);
  console.log(`${colors.yellow}Some optimizations may not be applied.${colors.reset}\n`);
}

// Environment variables for the server
const env = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: process.env.PORT || '3001'
};

// Start the server
console.log(`${colors.green}Starting server on port ${env.PORT}...${colors.reset}\n`);

const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '..'),
  env,
  stdio: 'inherit'
});

// Handle server process events
server.on('error', (err) => {
  console.error(`${colors.red}Failed to start server:${colors.reset}`, err);
  process.exit(1);
});

// Handle process signals
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}SIGINT received. Shutting down gracefully...${colors.reset}`);
  server.kill('SIGTERM');
});

process.on('SIGTERM', () => {
  console.log(`\n${colors.yellow}SIGTERM received. Shutting down gracefully...${colors.reset}`);
  server.kill('SIGTERM');
});

// Exit when the server exits
server.on('close', (code) => {
  console.log(`\n${colors.blue}Server process exited with code ${code}${colors.reset}`);
  process.exit(code);
}); 