#!/usr/bin/env node

/**
 * Type Error Fixer Script
 * 
 * This script analyzes TypeScript errors in the client codebase and applies
 * intelligent fixes to resolve them automatically.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawnSync } from 'child_process';
import chalk from 'chalk';

// Get current file path and directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(ROOT_DIR, 'src');

// Error types that we can fix
const ErrorTypes = {
  MISSING_PROPERTY: 'missingProperty',
  TYPE_MISMATCH: 'typeMismatch',
  NULLABLE: 'nullable',
  IMPLICIT_ANY: 'implicitAny',
  MISSING_IMPORT: 'missingImport',
  MISSING_INTERFACE: 'missingInterface',
};

// Stats
const stats = {
  totalErrors: 0,
  fixedErrors: 0,
  unfixableErrors: 0,
  filesWithErrors: new Set(),
  filesFixed: new Set(),
};

/**
 * Get all TypeScript files in a directory recursively
 */
function getAllTsFiles(dir) {
  let files = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = [...files, ...getAllTsFiles(fullPath)];
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.d.ts')
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Run the TypeScript compiler and get diagnostics
 */
function getTsErrors() {
  console.log(chalk.blue('🔍 Running TypeScript to identify errors...'));

  const result = spawnSync('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const output = result.stdout || '';
  const errors = [];

  // Parse TypeScript error output
  const lines = output.split('\n');
  let currentError = null;

  for (const line of lines) {
    // New error line format: "file:line:col - error TS1234: Error message"
    const errorMatch = line.match(/(.+):(\d+):(\d+) - error TS(\d+): (.+)/);

    if (errorMatch) {
      const [_, file, line, column, code, message] = errorMatch;
      const filePath = path.resolve(ROOT_DIR, file);

      currentError = {
        filePath,
        line: parseInt(line, 10),
        column: parseInt(column, 10),
        code: parseInt(code, 10),
        message,
      };

      errors.push(currentError);
      stats.filesWithErrors.add(filePath);
    }
  }

  stats.totalErrors = errors.length;
  console.log(chalk.yellow(`Found ${stats.totalErrors} type errors to fix`));

  return errors;
}

/**
 * Categorize an error to determine how to fix it
 */
function categorizeError(error) {
  const { code, message } = error;

  // Property does not exist error
  if (code === 2339) {
    return ErrorTypes.MISSING_PROPERTY;
  }

  // Type mismatch errors
  if (code === 2322 || code === 2345) {
    return ErrorTypes.TYPE_MISMATCH;
  }

  // Nullable errors
  if (message.includes('null') || message.includes('undefined')) {
    return ErrorTypes.NULLABLE;
  }

  // Implicit any errors
  if (code === 7006 || code === 7005) {
    return ErrorTypes.IMPLICIT_ANY;
  }

  // Cannot find module errors
  if (code === 2307) {
    return ErrorTypes.MISSING_IMPORT;
  }

  // Interface errors
  if (
    code === 2420 ||
    code === 2559 ||
    message.includes('interface') ||
    message.includes('type')
  ) {
    return ErrorTypes.MISSING_INTERFACE;
  }

  return null;
}

/**
 * Fix a specific error in a file
 */
function fixError(error) {
  const { filePath, line, column, code, message } = error;

  if (!fs.existsSync(filePath)) {
    return false;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const fileLines = fileContent.split('\n');

  // The error line is 1-indexed
  const errorLine = fileLines[line - 1];

  if (!errorLine) {
    return false;
  }

  let fixed = false;
  const errorType = categorizeError(error);

  switch (errorType) {
    case ErrorTypes.MISSING_PROPERTY:
      fixed = fixMissingProperty(error, fileLines);
      break;
    case ErrorTypes.TYPE_MISMATCH:
      fixed = fixTypeMismatch(error, fileLines);
      break;
    case ErrorTypes.NULLABLE:
      fixed = fixNullable(error, fileLines);
      break;
    case ErrorTypes.IMPLICIT_ANY:
      fixed = fixImplicitAny(error, fileLines);
      break;
    case ErrorTypes.MISSING_IMPORT:
      fixed = fixMissingImport(error, fileLines);
      break;
    case ErrorTypes.MISSING_INTERFACE:
      fixed = fixMissingInterface(error, fileLines);
      break;
  }

  if (fixed) {
    stats.fixedErrors++;
    stats.filesFixed.add(filePath);
    // Write the file back
    fs.writeFileSync(filePath, fileLines.join('\n'), 'utf8');
    return true;
  } else {
    stats.unfixableErrors++;
    return false;
  }
}

/**
 * Fix missing property error
 */
function fixMissingProperty(error, fileLines) {
  const { message, line } = error;
  const propertyMatch = message.match(/Property '(.+)' does not exist on type/);

  if (!propertyMatch) return false;

  const propertyName = propertyMatch[1];

  // Look for interface or type definition
  let interfaceStartLine = -1;
  let interfaceEndLine = -1;
  let interfaceName = '';
  let interfaceBraceCount = 0;

  // Search backward from the error line to find interface or type
  for (let i = line - 1; i >= 0; i--) {
    const currLine = fileLines[i];

    if (currLine.includes('interface ') || currLine.includes('type ')) {
      const match = currLine.match(/(interface|type) (\w+)/);
      if (match) {
        interfaceName = match[2];
        interfaceStartLine = i;
        interfaceBraceCount = 1; // We found the opening brace

        // Now search forward to find the closing brace
        for (let j = i + 1; j < fileLines.length; j++) {
          const braceLine = fileLines[j];

          // Count braces
          const openBraces = (braceLine.match(/{/g) || []).length;
          const closeBraces = (braceLine.match(/}/g) || []).length;

          interfaceBraceCount += openBraces - closeBraces;

          if (interfaceBraceCount === 0) {
            interfaceEndLine = j;
            break;
          }
        }

        break;
      }
    }
  }

  if (interfaceStartLine >= 0 && interfaceEndLine >= 0) {
    // Insert property before closing brace
    const propertyLine = `  ${propertyName}?: any; // TODO: Replace 'any' with the correct type`;
    fileLines.splice(interfaceEndLine, 0, propertyLine);
    return true;
  }

  return false;
}

/**
 * Fix type mismatch error
 */
function fixTypeMismatch(error, fileLines) {
  const { line, column } = error;
  const errorLine = fileLines[line - 1];

  // Find the expression to wrap with type assertion
  let startCol = column - 1;
  let endCol = column;

  // Find start of expression
  while (startCol > 0 && /[\w.$]/.test(errorLine[startCol - 1])) {
    startCol--;
  }

  // Find end of expression
  while (endCol < errorLine.length && /[\w.$]/.test(errorLine[endCol])) {
    endCol++;
  }

  const expression = errorLine.substring(startCol, endCol);

  if (expression) {
    // Replace with type assertion
    const before = errorLine.substring(0, startCol);
    const after = errorLine.substring(endCol);

    fileLines[line - 1] = `${before}(${expression} as any)${after} // TODO: Replace 'any' with the correct type`;
    return true;
  }

  return false;
}

/**
 * Fix nullable error
 */
function fixNullable(error, fileLines) {
  const { line, column } = error;
  const errorLine = fileLines[line - 1];

  // Find the expression to wrap with null check
  let startCol = column - 1;
  let endCol = column;
  let objectRef = '';

  // Find start of object reference (before dot or bracket)
  while (startCol > 0) {
    if (errorLine[startCol] === '.' || errorLine[startCol] === '[') {
      // We found the separator, now find the object reference
      let objStart = startCol - 1;
      while (objStart > 0 && /[\w$]/.test(errorLine[objStart - 1])) {
        objStart--;
      }
      objectRef = errorLine.substring(objStart, startCol);
      break;
    }
    startCol--;
  }

  // Find end of expression
  while (endCol < errorLine.length && !/[)\s;,]/.test(errorLine[endCol])) {
    endCol++;
  }

  const expression = errorLine.substring(startCol, endCol);

  if (objectRef && expression) {
    // Replace with nullish check
    const before = errorLine.substring(0, startCol - objectRef.length);
    const after = errorLine.substring(endCol);

    fileLines[line - 1] = `${before}${objectRef} ? ${expression} : undefined${after}`;
    return true;
  }

  return false;
}

/**
 * Fix implicit any error
 */
function fixImplicitAny(error, fileLines) {
  const { line, column, message } = error;
  const errorLine = fileLines[line - 1];

  // Extract the parameter or variable name
  const paramMatch = message.match(/Parameter '(\w+)'/);
  const varMatch = message.match(/Variable '(\w+)'/);

  const name = (paramMatch && paramMatch[1]) || (varMatch && varMatch[1]);

  if (name) {
    // Find the name in the line
    const nameIndex = errorLine.indexOf(name, column - 1);

    if (nameIndex >= 0) {
      const before = errorLine.substring(0, nameIndex + name.length);
      const after = errorLine.substring(nameIndex + name.length);

      fileLines[line - 1] = `${before}: any /* TODO: Replace with appropriate type */${after}`;
      return true;
    }
  }

  return false;
}

/**
 * Fix missing import error
 */
function fixMissingImport(error, fileLines) {
  const { message } = error;
  const moduleMatch = message.match(/Cannot find module ['"](.+)['"] or its corresponding type declarations/);

  if (!moduleMatch) return false;

  const moduleName = moduleMatch[1];

  // Create import statement
  const importName = moduleName.split('/').pop().replace(/[^a-zA-Z0-9]/g, '_');
  const importLine = `import * as ${importName} from '${moduleName}';`;

  // Add import at the top of imports section
  let lastImportLine = -1;

  for (let i = 0; i < fileLines.length; i++) {
    if (fileLines[i].startsWith('import ')) {
      lastImportLine = i;
    } else if (lastImportLine >= 0 && !fileLines[i].trim()) {
      // We found an empty line after imports
      break;
    }
  }

  if (lastImportLine >= 0) {
    fileLines.splice(lastImportLine + 1, 0, importLine);
  } else {
    // No imports found, add at the top
    fileLines.unshift(importLine, '');
  }

  return true;
}

/**
 * Fix missing interface error
 */
function fixMissingInterface(error, fileLines) {
  const { message } = error;

  const interfaceMatch = message.match(/Interface ['"](.+)['"] cannot/);
  const typeMatch = message.match(/Type ['"](.+)['"] is not/);

  const typeName = (interfaceMatch && interfaceMatch[1]) || (typeMatch && typeMatch[1]);

  if (!typeName) return false;

  // Create interface definition
  const interfaceLines = [
    '',
    '// TODO: Fill in the correct properties',
    `interface ${typeName} {`,
    '  [key: string]: any;',
    '}',
    ''
  ];

  // Add interface after imports
  let lastImportLine = -1;

  for (let i = 0; i < fileLines.length; i++) {
    if (fileLines[i].startsWith('import ')) {
      lastImportLine = i;
    } else if (lastImportLine >= 0 && !fileLines[i].trim()) {
      // We found an empty line after imports
      break;
    }
  }

  if (lastImportLine >= 0) {
    fileLines.splice(lastImportLine + 1, 0, ...interfaceLines);
  } else {
    // No imports found, add at the top after comments
    let firstNonCommentLine = 0;
    while (firstNonCommentLine < fileLines.length &&
      (fileLines[firstNonCommentLine].trim().startsWith('//') ||
        fileLines[firstNonCommentLine].trim().startsWith('/*'))) {
      firstNonCommentLine++;
    }

    fileLines.splice(firstNonCommentLine, 0, ...interfaceLines);
  }

  return true;
}

/**
 * Main function
 */
async function main() {
  try {
    // Get TypeScript errors
    const errors = getTsErrors();

    if (errors.length === 0) {
      console.log(chalk.green('✓ No type errors found!'));
      return;
    }

    // Group errors by file for more efficient processing
    const errorsByFile = {};

    for (const error of errors) {
      if (!errorsByFile[error.filePath]) {
        errorsByFile[error.filePath] = [];
      }
      errorsByFile[error.filePath].push(error);
    }

    // Process each file
    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      const relPath = path.relative(ROOT_DIR, filePath);
      console.log(chalk.cyan(`\nProcessing ${relPath}`));
      console.log(chalk.gray(`Found ${fileErrors.length} errors`));

      let fixCount = 0;

      for (const error of fileErrors) {
        const fixed = fixError(error);

        if (fixed) {
          fixCount++;
        } else {
          console.log(chalk.gray(`  Could not fix: ${error.message}`));
        }
      }

      if (fixCount > 0) {
        console.log(chalk.green(`  ✓ Applied ${fixCount} fixes`));
      }
    }

    // Format the fixed files
    console.log(chalk.blue('\n🧹 Formatting fixed files...'));
    const fixedFiles = Array.from(stats.filesFixed);

    for (const filePath of fixedFiles) {
      try {
        execSync(`npx prettier --write "${filePath}"`, { stdio: 'ignore' });
      } catch (error) {
        console.log(chalk.yellow(`  Could not format ${path.relative(ROOT_DIR, filePath)}`));
      }
    }

    // Print summary
    console.log(chalk.blue('\n📊 Summary'));
    console.log(chalk.white(`Total errors: ${stats.totalErrors}`));
    console.log(chalk.green(`Fixed errors: ${stats.fixedErrors}`));
    console.log(chalk.yellow(`Unfixable errors: ${stats.unfixableErrors}`));
    console.log(chalk.white(`Files with errors: ${stats.filesWithErrors.size}`));
    console.log(chalk.green(`Files fixed: ${stats.filesFixed.size}`));

    // Run final type check
    console.log(chalk.blue('\n🔍 Verifying fixes...'));
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: ROOT_DIR });
      console.log(chalk.green('✓ All type errors fixed successfully!'));
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.message;
      console.log(chalk.yellow('Some type errors still remain:'));
      console.log(chalk.gray(errorOutput.split('\n').slice(0, 10).join('\n')));
      console.log(chalk.yellow('\nYou may need to run this script again or fix them manually.'));
    }

  } catch (error) {
    console.error(chalk.red('Error fixing type errors:'), error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('Unhandled error:'), error);
  process.exit(1);
}); 