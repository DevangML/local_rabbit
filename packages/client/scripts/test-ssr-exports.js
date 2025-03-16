/**
 * Test script to verify the SSR exports
 * This script loads the entry-server.js file and checks if it has the required exports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const serverFile = path.join(rootDir, 'dist', 'server', 'entry-server.js');

console.log(`Testing server file: ${serverFile}`);

if (!fs.existsSync(serverFile)) {
  console.error(`Error: The entry-server.js file does not exist at ${serverFile}`);
  process.exit(1);
}

try {
  // Import the file
  const entryServer = await import(serverFile);

  // Check if renderPage is exported
  if (typeof entryServer.renderPage !== 'function') {
    console.error('Error: renderPage is not exported as a function');
    console.log('Available exports:', Object.keys(entryServer));
    process.exit(1);
  }

  // Check if renderToStream is exported
  if (typeof entryServer.renderToStream !== 'function') {
    console.error('Warning: renderToStream is not exported as a function');
    console.log('Available exports:', Object.keys(entryServer));
  }

  console.log('Success: The entry-server.js file has the required exports');
  console.log('Available exports:', Object.keys(entryServer));

} catch (error) {
  console.error('Error importing the entry-server.js file:', error);
  process.exit(1);
} 