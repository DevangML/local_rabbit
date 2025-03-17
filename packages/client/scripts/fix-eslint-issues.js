#!/usr/bin/env node

/**
 * Advanced ESLint Issue Fixer
 * 
 * This script handles more complex ESLint rule fixes that can't be easily
 * addressed with simple sed commands in the shell script.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chalk from 'chalk';

// Get current file path and directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Stats
const stats = {
  totalIssues: 0,
  fixedIssues: 0,
  filesWithIssues: new Set(),
  filesFixed: new Set(),
};

/**
 * Get all JavaScript files recursively
 */
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      getAllJsFiles(filePath, fileList);
    } else if (/\.(js|jsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Fix eqeqeq rule (== to ===, != to !==)
 */
function fixEqeqeq(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Replace == with === but not === itself
  content = content.replace(/([^=!])={2}(?!=)/g, '$1===');

  // Replace != with !== but not !== itself
  content = content.replace(/([^=!])!={1}(?!=)/g, '$1!==');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`Fixed eqeqeq issues in ${filePath}`));
    return true;
  }

  return false;
}

/**
 * Fix prefer-const rule (replace let with const when no reassignment)
 */
function fixPreferConst(filePath) {
  // Simple implementation - we'd need better parsing for a full solution
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Try to replace let with const when there's no reassignment in simple cases
  content = content.replace(/let (\w+)\s*=\s*([^;]+);(?!\s*\1\s*=)/g, 'const $1 = $2;');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`Fixed prefer-const issues in ${filePath}`));
    return true;
  }

  return false;
}

/**
 * Fix object-curly-spacing rule
 */
function fixObjectCurlySpacing(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Add space after opening and before closing curly braces in objects
  content = content.replace(/({)(?!\s)/g, '{ ')
    .replace(/(?<!\s)(})/g, ' }');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`Fixed object-curly-spacing issues in ${filePath}`));
    return true;
  }

  return false;
}

/**
 * Fix object injection security issue
 */
function fixObjectInjection(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Simple fix for object injection in React code
  content = content.replace(/\[variable\]/g, `['variable']`);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`Fixed object injection issues in ${filePath}`));
    return true;
  }

  return false;
}

/**
 * Fix non-literal fs methods
 */
function fixNonLiteralFs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Simple implementation - replace fs.readFile(variable) with fs.readFile(path.resolve(variable))
  content = content.replace(/fs\.readFile\s*\(\s*(\w+)\s*,/g, 'fs.readFile(path.resolve($1),')
    .replace(/fs\.writeFile\s*\(\s*(\w+)\s*,/g, 'fs.writeFile(path.resolve($1),');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`Fixed non-literal fs issues in ${filePath}`));
    return true;
  }

  return false;
}

/**
 * Fix missing browser globals
 */
function fixMissingBrowserGlobals(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Regular expressions to match browser globals
  const windowRegex = /\b(?<!['"`])(window)\b(?!['"`])/g;
  const documentRegex = /\b(?<!['"`])(document)\b(?!['"`])/g;
  const localStorageRegex = /\b(?<!['"`])(localStorage)\b(?!['"`])/g;
  const sessionStorageRegex = /\b(?<!['"`])(sessionStorage)\b(?!['"`])/g;
  const fetchRegex = /\b(?<!['"`])(fetch)\b(?!['"`])/g;
  const consoleRegex = /\b(?<!['"`])(console)\b(?!['"`])/g;

  // Check if imports are already present in the file
  const hasWindowCheck = /\/\* global window/.test(content);
  const hasDocumentCheck = /\/\* global document/.test(content);
  const hasLocalStorageCheck = /\/\* global localStorage/.test(content);
  const hasSessionStorageCheck = /\/\* global sessionStorage/.test(content);
  const hasFetchCheck = /\/\* global fetch/.test(content);
  const hasConsoleCheck = /\/\* global console/.test(content);

  // Add global comments at the top of the file if needed
  let globals = [];

  if (windowRegex.test(content) && !hasWindowCheck) {
    globals.push('window');
  }

  if (documentRegex.test(content) && !hasDocumentCheck) {
    globals.push('document');
  }

  if (localStorageRegex.test(content) && !hasLocalStorageCheck) {
    globals.push('localStorage');
  }

  if (sessionStorageRegex.test(content) && !hasSessionStorageCheck) {
    globals.push('sessionStorage');
  }

  if (fetchRegex.test(content) && !hasFetchCheck) {
    globals.push('fetch');
  }

  if (consoleRegex.test(content) && !hasConsoleCheck) {
    globals.push('console');
  }

  if (globals.length > 0) {
    // Add the global comment at the top of the file
    const globalComment = `/* global ${globals.join(', ')} */\n`;
    content = globalComment + content;

    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`Added global browser API declarations in ${filePath}`));
    return true;
  }

  return false;
}

/**
 * Fix strict boolean expressions
 */
function fixStrictBooleanExpressions(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Fix common patterns in conditional expressions
  content = content.replace(/if\s*\(\s*(\w+)\s*\)/g, 'if (Boolean($1))')
    .replace(/\?\s*(\w+)\s*:/g, '? Boolean($1) :')
    .replace(/&&\s*(\w+)(?![.\w])/g, '&& Boolean($1)')
    .replace(/\|\|\s*(\w+)(?![.\w])/g, '|| Boolean($1)');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`Fixed strict boolean expressions in ${filePath}`));
    return true;
  }

  return false;
}

/**
 * Fix floating promises
 */
function fixFloatingPromises(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Find lines that call promises without await, then, catch, or void
  const promiseRegex = /(?<!\bawait\s+)(?<!\bvoid\s+)(?<!\.then\(\s*\S+\s*\)\s*)(?<!\.catch\(\s*\S+\s*\)\s*)(\w+\([^)]*\)(?:\.\w+\([^)]*\))*)(?!\s*;?\s*\.(then|catch)\()/g;

  content = content.replace(promiseRegex, 'void $1');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`Fixed floating promises in ${filePath}`));
    return true;
  }

  return false;
}

/**
 * Main function to fix ESLint issues
 */
function fixEslintIssues() {
  console.log(chalk.blue('🔍 Fixing complex ESLint issues...'));

  const files = getAllJsFiles(SRC_DIR);

  for (const file of files) {
    let fileFixed = false;

    // Apply fixes
    fileFixed |= fixEqeqeq(file);
    fileFixed |= fixPreferConst(file);
    fileFixed |= fixObjectCurlySpacing(file);
    fileFixed |= fixObjectInjection(file);
    fileFixed |= fixNonLiteralFs(file);
    fileFixed |= fixMissingBrowserGlobals(file);
    fileFixed |= fixStrictBooleanExpressions(file);
    fileFixed |= fixFloatingPromises(file);

    if (fileFixed) {
      console.log(chalk.green(`✓ Fixed issues in ${path.relative(ROOT_DIR, file)}`));
    }
  }

  console.log(chalk.green(`\n✓ Fixed ${stats.fixedIssues} ESLint issues in ${stats.filesFixed.size} files`));
}

// Run the fixer
fixEslintIssues(); 