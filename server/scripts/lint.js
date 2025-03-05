#!/usr/bin/env node

/**
 * Advanced linting script with detailed reporting
 * Run with: node scripts/lint.js [--fix] [--staged]
 */

const { execSync } = require('child_process');
const chalk = require('chalk');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const stagedOnly = args.includes('--staged');

// Configuration
const ESLINT_CONFIG_PATH = path.resolve(__dirname, '..', '.eslintrc.js');
const IGNORE_PATTERNS = ['node_modules', 'dist', 'build', 'coverage', '.git'];

// Ensure ESLint config exists
if (!fs.existsSync(ESLINT_CONFIG_PATH)) {
  console.error(chalk.red('Error: ESLint config not found at', ESLINT_CONFIG_PATH));
  process.exit(1);
}

/**
 * Get files to lint
 * @returns {string[]} Array of file paths
 */
function getFilesToLint() {
  try {
    if (stagedOnly) {
      // Get staged JS files
      const output = execSync('git diff --cached --name-only --diff-filter=ACMR "*.js"', { encoding: 'utf8' });
      return output
        .split('\n')
        .filter(Boolean)
        .filter(file => !IGNORE_PATTERNS.some(pattern => file.includes(pattern)));
    }
    
    // Get all JS files
    const output = execSync(
      `find . -type f -name "*.js" ${IGNORE_PATTERNS.map(p => `-not -path "*/${p}/*"`).join(' ')}`,
      { encoding: 'utf8' }
    );
    
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error(chalk.red('Error getting files to lint:'), error.message);
    return [];
  }
}

/**
 * Run ESLint on files
 * @param {string[]} files - Files to lint
 * @returns {Object} Lint results
 */
function runEslint(files) {
  if (!files.length) {
    console.log(chalk.yellow('No files to lint'));
    return { success: true, output: '', errorCount: 0, warningCount: 0 };
  }

  const fixFlag = shouldFix ? '--fix' : '';
  const formatFlag = '--format json';
  const command = `npx eslint ${fixFlag} ${formatFlag} ${files.join(' ')}`;
  
  try {
    const output = execSync(command, { encoding: 'utf8' });
    const results = JSON.parse(output);
    
    // Calculate total errors and warnings
    const stats = results.reduce(
      (acc, file) => {
        acc.errorCount += file.errorCount;
        acc.warningCount += file.warningCount;
        return acc;
      },
      { errorCount: 0, warningCount: 0 }
    );
    
    return { 
      success: stats.errorCount === 0, 
      output, 
      results,
      ...stats
    };
  } catch (error) {
    // ESLint returns non-zero exit code when there are errors
    try {
      const results = JSON.parse(error.stdout);
      
      // Calculate total errors and warnings
      const stats = results.reduce(
        (acc, file) => {
          acc.errorCount += file.errorCount;
          acc.warningCount += file.warningCount;
          return acc;
        },
        { errorCount: 0, warningCount: 0 }
      );
      
      return { 
        success: false, 
        output: error.stdout, 
        results,
        ...stats
      };
    } catch (parseError) {
      console.error(chalk.red('Error parsing ESLint output:'), parseError.message);
      console.error(error.stdout || error.message);
      return { success: false, output: error.message, errorCount: 1, warningCount: 0 };
    }
  }
}

/**
 * Format and display lint results
 * @param {Object} lintResult - Lint results
 * @param {string[]} files - Files that were linted
 */
function displayResults(lintResult, files) {
  console.log(chalk.bold('\n=== ESLint Results ==='));
  console.log(`Files checked: ${chalk.cyan(files.length)}`);
  
  if (lintResult.success && lintResult.errorCount === 0 && lintResult.warningCount === 0) {
    console.log(chalk.green('✓ All files pass linting!'));
    return;
  }
  
  console.log(`Errors: ${chalk.red(lintResult.errorCount)}`);
  console.log(`Warnings: ${chalk.yellow(lintResult.warningCount)}`);
  
  if (!lintResult.results) {
    console.log(chalk.red('No detailed results available'));
    return;
  }
  
  // Group issues by file
  const fileIssues = lintResult.results
    .filter(file => file.messages.length > 0)
    .map(file => {
      const relativePath = path.relative(process.cwd(), file.filePath);
      const errors = file.messages.filter(msg => msg.severity === 2);
      const warnings = file.messages.filter(msg => msg.severity === 1);
      
      return {
        path: relativePath,
        errors,
        warnings,
        messages: _.sortBy(file.messages, ['line', 'column']),
      };
    });
  
  if (fileIssues.length === 0) {
    console.log(chalk.green('No issues found in any files!'));
    return;
  }
  
  // Display issues by file
  fileIssues.forEach(file => {
    console.log(`\n${chalk.underline(file.path)}`);
    console.log(`  ${chalk.red(`${file.errors.length} errors`)}, ${chalk.yellow(`${file.warnings.length} warnings`)}`);
    
    file.messages.forEach(msg => {
      const location = `${msg.line}:${msg.column}`;
      const severity = msg.severity === 2 
        ? chalk.red('error') 
        : chalk.yellow('warning');
      const ruleId = msg.ruleId ? chalk.gray(`(${msg.ruleId})`) : '';
      
      console.log(`  ${chalk.cyan(location)} ${severity}: ${msg.message} ${ruleId}`);
    });
  });
  
  // Summary of most common issues
  const allMessages = _.flatMap(fileIssues, 'messages');
  const ruleStats = _.countBy(allMessages, 'ruleId');
  const topIssues = Object.entries(ruleStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (topIssues.length > 0) {
    console.log('\n=== Most Common Issues ===');
    topIssues.forEach(([rule, count]) => {
      console.log(`${chalk.cyan(rule)}: ${count} occurrences`);
    });
  }
  
  // Provide fix instructions
  if (lintResult.errorCount > 0 && !shouldFix) {
    console.log(chalk.bold.yellow('\nTo automatically fix some issues, run:'));
    console.log(chalk.cyan('  node scripts/lint.js --fix'));
  }
}

// Main execution
console.log(chalk.bold('Running ESLint...'));
console.log(`Mode: ${stagedOnly ? 'Staged files only' : 'All files'}`);
console.log(`Auto-fix: ${shouldFix ? 'Enabled' : 'Disabled'}`);

const startTime = Date.now();
const files = getFilesToLint();
const lintResult = runEslint(files);
const duration = ((Date.now() - startTime) / 1000).toFixed(2);

displayResults(lintResult, files);
console.log(chalk.gray(`\nLinting completed in ${duration}s`));

// Exit with appropriate code
process.exit(lintResult.success ? 0 : 1); 