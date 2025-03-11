/**
 * Post-build script for SSR
 * This script ensures the entry-server.js file is in the correct location
 * by copying it from dist/server/entry-server.js to dist/entry-server.js if needed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Define paths
const sourceFile = path.join(rootDir, 'dist', 'server', 'entry-server.js');
const targetDir = path.join(rootDir, 'dist', 'server');
const targetFile = path.join(targetDir, 'entry-server.js');

// Ensure the target directory exists
if (!fs.existsSync(targetDir)) {
  console.log(`Creating directory: ${targetDir}`);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Check if the source file exists
if (fs.existsSync(sourceFile)) {
  console.log(`Copying ${sourceFile} to ${targetFile}`);
  fs.copyFileSync(sourceFile, targetFile);
  console.log('File copied successfully');
} else {
  console.log(`Source file not found: ${sourceFile}`);

  // Check if the file already exists in the target location
  if (fs.existsSync(targetFile)) {
    console.log(`Target file already exists: ${targetFile}`);
  } else {
    console.error('ERROR: entry-server.js not found in either location!');
    process.exit(1);
  }
}

console.log('Post-build SSR script completed successfully'); 