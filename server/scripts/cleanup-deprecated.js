/**
 * Cleanup script to remove deprecated files
 * 
 * This script removes the old GitService implementation and projects.js routes
 * that have been deprecated in favor of the new SecureGitService implementation.
 * 
 * Usage: node cleanup-deprecated.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Files to be removed
const filesToRemove = [
  path.join(__dirname, '..', 'routes', 'projects.js'),
  path.join(__dirname, '..', 'src', 'services', 'GitService.js'),
  path.join(__dirname, '..', 'src', 'controllers', 'repositoryController.js'),
  path.join(__dirname, '..', 'src', 'controllers', 'diffController.js')
];

// Check if files exist
const existingFiles = filesToRemove.filter(file => fs.existsSync(file));

if (existingFiles.length === 0) {
  console.log('No deprecated files found. Nothing to remove.');
  rl.close();
} else {
  console.log('The following deprecated files will be removed:');
  existingFiles.forEach(file => console.log(`- ${file}`));

  rl.question('\nAre you sure you want to remove these files? (y/n) ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      // Remove files
      existingFiles.forEach(file => {
        try {
          fs.unlinkSync(file);
          console.log(`Removed: ${file}`);
        } catch (error) {
          console.error(`Error removing ${file}:`, error);
        }
      });

      console.log('\nDeprecated files have been removed successfully.');
      console.log('Please make sure to update any remaining references to these files in your codebase.');
    } else {
      console.log('Operation cancelled. No files were removed.');
    }

    rl.close();
  });
}

rl.on('close', () => {
  console.log('\nCleanup script completed.');
  process.exit(0);
});