/**
 * Script to install performance-related dependencies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define dependencies to install
const dependencies = [
  'compression@1.7.4',
  'express-rate-limit@7.1.5',
];

console.log('Installing performance-related dependencies...');

try {
  // Install dependencies
  execSync(`npm install ${dependencies.join(' ')} --save`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('\n✅ Successfully installed dependencies:');
  dependencies.forEach(dep => console.log(`  - ${dep}`));

  // Create a note about what was installed
  const notePath = path.join(__dirname, '..', 'PERFORMANCE_DEPS_INSTALLED.md');
  const noteContent = `# Performance Dependencies Installed\n\n` +
    `The following dependencies were installed for performance optimizations:\n\n` +
    dependencies.map(dep => `- ${dep}`).join('\n') +
    `\n\nInstalled on: ${new Date().toISOString()}\n`;

  fs.writeFileSync(notePath, noteContent);
  console.log(`\nCreated note at: ${notePath}`);

  console.log('\nTo use these dependencies, make sure to update your code accordingly.');
  console.log('See EXPRESS_PERFORMANCE_OPTIMIZATIONS.md for details on implementation.');

} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
} 