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
const SRC_DIR = path.resolve(ROOT_DIR, 'src');

// Stats
const stats = {
  totalIssues: 0,
  fixedIssues: 0,
  filesWithIssues: new Set(),
  filesFixed: new Set(),
};

/**
 * Get all JavaScript/TypeScript files in a directory recursively
 */
function getAllJsFiles(dir) {
  let files = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = [...files, ...getAllJsFiles(fullPath)];
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.js') ||
        entry.name.endsWith('.jsx') ||
        entry.name.endsWith('.ts') ||
        entry.name.endsWith('.tsx'))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Fix eqeqeq rule (=== instead of ==)
 */
function fixEqeqeq(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;

  // Replace == with === and != with !==, but be careful with existing === and !==
  const newContent = content
    .replace(/([^=!])===?([^=])/g, (match, before, after) => {
      if (match.includes('===')) return match;
      fixed = true;
      return `${before}===${after}`;
    })
    .replace(/([^!])!==?([^=])/g, (match, before, after) => {
      if (match.includes('!==')) return match;
      fixed = true;
      return `${before}!==${after}`;
    });

  if (fixed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    stats.fixedIssues++;
    stats.filesFixed.add(filePath);
    return true;
  }

  return false;
}

/**
 * Fix prefer-const rule (use const instead of let when variable is never reassigned)
 */
function fixPreferConst(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;

  // This is a simplified approach - a proper fix would need to analyze the AST
  // to determine if variables are reassigned
  const lines = content.split('\n');
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line has a let declaration that's not reassigned in the file
    if (line.match(/^\s*let\s+([a-zA-Z0-9_$]+)\s*=/)) {
      const varName = line.match(/^\s*let\s+([a-zA-Z0-9_$]+)\s*=/)[1];

      // Simple heuristic: if the variable name doesn't appear with an = sign after this line,
      // it's probably safe to convert to const
      const remainingContent = lines.slice(i + 1).join('\n');
      const reassignmentRegex = new RegExp(`${varName}\\s*=`, 'g');

      if (!reassignmentRegex.test(remainingContent)) {
        newLines.push(line.replace(/^\s*let\s+/, 'const '));
        fixed = true;
        continue;
      }
    }

    newLines.push(line);
  }

  if (fixed) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    stats.fixedIssues++;
    stats.filesFixed.add(filePath);
    return true;
  }

  return false;
}

/**
 * Fix object-curly-spacing rule (ensure spaces inside curly braces)
 */
function fixObjectCurlySpacing(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;

  // Add spaces inside object curly braces if missing
  const newContent = content
    .replace(/({)([^\s{}])/g, (match, brace, after) => {
      fixed = true;
      return `${brace} ${after}`;
    })
    .replace(/([^\s{}])(})/g, (match, before, brace) => {
      fixed = true;
      return `${before} ${brace}`;
    });

  if (fixed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    stats.fixedIssues++;
    stats.filesFixed.add(filePath);
    return true;
  }

  return false;
}

/**
 * Fix security/detect-object-injection rule
 */
function fixObjectInjection(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;

  // Look for patterns like obj[variable] and replace with safer alternatives
  // This is a simplified approach - a proper fix would need to analyze the AST
  const newContent = content.replace(/(\w+)\[([^"'\]]+)\]/g, (match, obj, key) => {
    // Skip if the key is a number or already has Object.hasOwn
    if (/^\d+$/.test(key) || match.includes('Object.hasOwn')) return match;

    fixed = true;
    return `(Object.hasOwn(${obj}, ${key}) ? ${obj}[${key}] : undefined)`;
  });

  if (fixed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    stats.fixedIssues++;
    stats.filesFixed.add(filePath);
    return true;
  }

  return false;
}

/**
 * Fix security/detect-non-literal-fs-filename rule
 */
function fixNonLiteralFs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;

  // Check if file imports fs
  if (!content.includes('fs.') && !content.includes('require(\'fs\')') && !content.includes('from \'fs\'')) {
    return false;
  }

  // Look for fs methods with non-literal arguments and add path.resolve
  const fsMethodsRegex = /(fs\.(readFile|writeFile|appendFile|readdir|stat|unlink|mkdir|rmdir))\(([^)]*)\)/g;

  const newContent = content.replace(fsMethodsRegex, (match, method, funcName, args) => {
    // Skip if already using path.resolve or the argument is a string literal
    if (match.includes('path.resolve') || /\(['"]/.test(match)) return match;

    fixed = true;

    // Add path.resolve to the first argument
    const argParts = args.split(',');
    const firstArg = argParts[0].trim();
    const restArgs = argParts.slice(1).join(',');

    return `${method}(path.resolve(${firstArg})${restArgs ? `, ${restArgs}` : ''})`;
  });

  if (fixed) {
    // Make sure path is imported if it's not already
    if (!content.includes('require(\'path\')') && !content.includes('from \'path\'')) {
      const importStatement = content.includes('import ')
        ? 'import path from \'path\';\n'
        : 'const path = require(\'path\');\n';

      // Add import at the top of the file, after any existing imports
      const lines = newContent.split('\n');
      let insertIndex = 0;

      // Find the right place to insert the import
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('import ') || lines[i].includes('require(')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() !== '' && insertIndex > 0) {
          break;
        }
      }

      lines.splice(insertIndex, 0, importStatement);
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    } else {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }

    stats.fixedIssues++;
    stats.filesFixed.add(filePath);
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

    if (fileFixed) {
      console.log(chalk.green(`✓ Fixed issues in ${path.relative(ROOT_DIR, file)}`));
    }
  }

  console.log(chalk.green(`\n✓ Fixed ${stats.fixedIssues} ESLint issues in ${stats.filesFixed.size} files`));
}

// Run the fixer
fixEslintIssues(); 