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
  MISSING_PROPERTY: 'missing_property',
  TYPE_MISMATCH: 'type_mismatch',
  NULLABLE: 'nullable',
  MISSING_RETURN_TYPE: 'missing_return_type',
  UNSAFE_ANY: 'unsafe_any',
  INVALID_ANY: 'invalid_any',
  STRICT_BOOLEAN: 'strict_boolean',
  IMPLICIT_ANY: 'implicitAny',
  MISSING_IMPORT: 'missingImport',
  MISSING_INTERFACE: 'missingInterface',
  PARSING_ERROR: 'parsingError',
  NO_UNSAFE_CALL: 'noUnsafeCall',
  NO_UNSAFE_ASSIGNMENT: 'noUnsafeAssignment',
  TS_PROJECT_ERROR: 'tsProjectError',
  EXPRESSION_EXPECTED: 'expressionExpected',
  IDENTIFIER_EXPECTED: 'identifierExpected',
  MISSING_CLASS_METHOD: 'missingClassMethod',
  JSX_ERROR: 'jsxError',
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
 * Get all TypeScript, JavaScript, JSX and TSX files in a directory recursively
 */
function getAllTsFiles(dir) {
  let files = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && !fullPath.includes('node_modules')) {
      files = [...files, ...getAllTsFiles(fullPath)];
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') ||
        entry.name.endsWith('.tsx') ||
        entry.name.endsWith('.js') ||
        entry.name.endsWith('.jsx')) &&
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
  console.log(chalk.blue('🔍 Running TypeScript and ESLint to identify errors...'));

  // Run TypeScript to get type errors
  const tsResult = spawnSync('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Run ESLint to get linting errors
  const eslintResult = spawnSync('npx', ['eslint', 'src', '--ext', '.ts,.tsx,.js,.jsx', '--format', 'json'], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const output = tsResult.stdout || '';
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

  // Parse ESLint error output if available
  let eslintErrors = [];
  try {
    const eslintOutput = eslintResult.stdout;
    if (eslintOutput && eslintOutput.trim()) {
      const eslintData = JSON.parse(eslintOutput);

      for (const fileResult of eslintData) {
        const filePath = path.resolve(ROOT_DIR, fileResult.filePath);

        for (const message of fileResult.messages) {
          if (message.ruleId &&
            (message.ruleId.startsWith('@typescript-eslint') ||
              message.ruleId === 'no-undef')) {
            errors.push({
              filePath,
              line: message.line,
              column: message.column,
              code: 0, // No specific code for ESLint errors
              message: message.message,
              ruleId: message.ruleId
            });
            stats.filesWithErrors.add(filePath);
          }
        }
      }
    }
  } catch (error) {
    console.log(chalk.yellow('Could not parse ESLint output. Continuing with TypeScript errors only.'));
  }

  stats.totalErrors = errors.length;
  console.log(chalk.yellow(`Found ${stats.totalErrors} type errors to fix`));

  return errors;
}

/**
 * Categorize an error to determine how to fix it
 */
function categorizeError(error) {
  const { code, message, ruleId } = error;

  // Handle ESLint errors
  if (ruleId) {
    if (ruleId === '@typescript-eslint/explicit-function-return-type') {
      return ErrorTypes.MISSING_RETURN_TYPE;
    }
    if (ruleId === '@typescript-eslint/no-unsafe-call') {
      return ErrorTypes.NO_UNSAFE_CALL;
    }
    if (ruleId === '@typescript-eslint/no-unsafe-assignment') {
      return ErrorTypes.NO_UNSAFE_ASSIGNMENT;
    }
    if (ruleId === '@typescript-eslint/strict-boolean-expressions') {
      return ErrorTypes.STRICT_BOOLEAN;
    }
    if (ruleId === '@typescript-eslint/no-explicit-any') {
      return ErrorTypes.UNSAFE_ANY;
    }
  }

  // Handle TS project configuration errors
  if (message && message.includes('"parserOptions.project" has been provided')) {
    return ErrorTypes.TS_PROJECT_ERROR;
  }

  // Handle specific parsing errors
  if (message) {
    // Expression expected
    if (message.includes("Expression expected")) {
      return ErrorTypes.EXPRESSION_EXPECTED;
    }

    // Identifier expected
    if (message.includes("Identifier expected")) {
      return ErrorTypes.IDENTIFIER_EXPECTED;
    }

    // Method expected in class
    if (message.includes("A constructor, method, accessor, or property was expected")) {
      return ErrorTypes.MISSING_CLASS_METHOD;
    }

    // JSX-specific errors
    if ((message.includes("JSX") || message.includes("tag")) &&
      (message.includes("expected") || message.includes("closing"))) {
      return ErrorTypes.JSX_ERROR;
    }

    // Generic parsing errors
    if (message.includes("Parsing error:") ||
      message.includes("expected") ||
      message.includes("Unexpected token") ||
      message.includes("is a reserved word")) {
      return ErrorTypes.PARSING_ERROR;
    }
  }

  // Property does not exist error
  if (code === 2339) {
    return ErrorTypes.MISSING_PROPERTY;
  }

  // Type mismatch errors
  if (code === 2322 || code === 2345) {
    return ErrorTypes.TYPE_MISMATCH;
  }

  // Nullable errors
  if (message && (message.includes('null') || message.includes('undefined'))) {
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
    (message && (message.includes('interface') || message.includes('type')))
  ) {
    return ErrorTypes.MISSING_INTERFACE;
  }

  if (message && message.includes('Missing return type on function')) {
    return ErrorTypes.MISSING_RETURN_TYPE;
  }

  if (message && message.includes('Unsafe') && message.includes('any')) {
    return ErrorTypes.UNSAFE_ANY;
  }

  if (message && message.includes('explicit comparison or type conversion is required')) {
    return ErrorTypes.STRICT_BOOLEAN;
  }

  return null;
}

/**
 * Fix a specific error in a file
 */
function fixError(error) {
  const { filePath, line, column, code, message, ruleId } = error;

  if (!fs.existsSync(filePath)) {
    return false;
  }

  // Get file content if not already passed
  let fileContent;
  try {
    fileContent = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.log(chalk.yellow(`Could not read file: ${filePath}`));
    return false;
  }

  const fileLines = fileContent.split('\n');

  // Check if error line is valid
  if (line <= 0 || line > fileLines.length) {
    // For errors at line 0 or beyond file length, it's likely a global error
    if (message && message.includes('"parserOptions.project" has been provided')) {
      return fixTsProjectError(error, fileLines);
    }
    return false;
  }

  // The error line is 1-indexed
  const errorLine = fileLines[line - 1];

  if (!errorLine && !ruleId) {
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
    case ErrorTypes.MISSING_RETURN_TYPE:
      fixed = fixMissingReturnType(error, fileLines);
      break;
    case ErrorTypes.UNSAFE_ANY:
      fixed = fixUnsafeAny(error, fileLines);
      break;
    case ErrorTypes.STRICT_BOOLEAN:
      fixed = fixStrictBoolean(error, fileLines);
      break;
    case ErrorTypes.NO_UNSAFE_CALL:
      fixed = fixUnsafeCall(error, fileLines);
      break;
    case ErrorTypes.NO_UNSAFE_ASSIGNMENT:
      fixed = fixUnsafeAssignment(error, fileLines);
      break;
    case ErrorTypes.PARSING_ERROR:
      fixed = fixParsingError(error, fileLines);
      break;
    case ErrorTypes.TS_PROJECT_ERROR:
      fixed = fixTsProjectError(error, fileLines);
      break;
    case ErrorTypes.EXPRESSION_EXPECTED:
      fixed = fixExpressionExpected(error, fileLines);
      break;
    case ErrorTypes.IDENTIFIER_EXPECTED:
      fixed = fixIdentifierExpected(error, fileLines);
      break;
    case ErrorTypes.MISSING_CLASS_METHOD:
      fixed = fixMissingClassMethod(error, fileLines);
      break;
    case ErrorTypes.JSX_ERROR:
      fixed = fixJsxError(error, fileLines);
      break;
    default:
      // Generic fix attempt based on message
      if (message) {
        if (message.includes('missing comma')) {
          fileLines[line - 1] = errorLine.trimRight() + ',';
          fixed = true;
        } else if (message.includes('missing semicolon')) {
          fileLines[line - 1] = errorLine.trimRight() + ';';
          fixed = true;
        }
      }
  }

  if (fixed) {
    stats.fixedErrors++;
    stats.filesFixed.add(filePath);
  } else {
    stats.unfixableErrors++;
  }

  return fixed;
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
 * Fix missing return type error
 */
function fixMissingReturnType(error, fileLines) {
  const { line } = error;
  const errorLine = fileLines[line - 1];

  // Look for function declarations and add return type
  const functionRegex = /function\s+(\w+)?\s*\(([^)]*)\)\s*{/;
  const arrowFunctionRegex = /(?:const|let|var)?\s*(\w+)?\s*(?:=|:)\s*(?:\([^)]*\)|\w+)\s*=>\s*{/;

  if (functionRegex.test(errorLine)) {
    // For regular functions
    const updatedLine = errorLine.replace(
      functionRegex,
      (match, name, params) => `function ${name || ''}(${params}): void {`
    );
    fileLines[line - 1] = updatedLine;
    return true;
  } else if (arrowFunctionRegex.test(errorLine)) {
    // For arrow functions
    const updatedLine = errorLine.replace(
      arrowFunctionRegex,
      (match, name, params) => {
        const prefix = match.substring(0, match.lastIndexOf('=>'));
        return `${prefix}): void => {`;
      }
    );
    fileLines[line - 1] = updatedLine;
    return true;
  }

  return false;
}

/**
 * Fix unsafe any error
 */
function fixUnsafeAny(error, fileLines) {
  const { line } = error;
  const errorLine = fileLines[line - 1];

  // First try to add type assertions
  if (errorLine.includes('.call(') || errorLine.includes('.member(')) {
    const updatedLine = errorLine.replace(/(\w+)\.(call|member)\(/, '$1 as any.$2(');
    fileLines[line - 1] = updatedLine;
    return true;
  }

  return false;
}

/**
 * Fix strict boolean error
 */
function fixStrictBoolean(error, fileLines) {
  const { line } = error;
  const errorLine = fileLines[line - 1];

  // Add explicit boolean checks
  if (errorLine.includes('if (') || errorLine.includes('while (')) {
    const condRegex = /(if|while)\s*\(([^)]+)\)/;
    const match = errorLine.match(condRegex);
    if (match) {
      const condition = match[2];
      const updatedLine = errorLine.replace(
        condRegex,
        `${match[1]} (Boolean(${condition}))`
      );
      fileLines[line - 1] = updatedLine;
      return true;
    }
  }

  return false;
}

/**
 * Fix unsafe call error
 */
function fixUnsafeCall(error, fileLines) {
  const { line } = error;
  const errorLine = fileLines[line - 1];

  // Look for function calls
  const callMatch = errorLine.match(/(\w+)\(([^)]*)\)/);
  if (callMatch) {
    const [fullMatch, funcName, args] = callMatch;
    const before = errorLine.substring(0, errorLine.indexOf(fullMatch));
    const after = errorLine.substring(errorLine.indexOf(fullMatch) + fullMatch.length);

    // Add a type assertion to the function call
    fileLines[line - 1] = `${before}(${funcName} as unknown as (...args: any[]) => any)(${args})${after}`;
    return true;
  }

  // Look for method calls
  const methodMatch = errorLine.match(/(\w+)\.(\w+)\(([^)]*)\)/);
  if (methodMatch) {
    const [fullMatch, objName, methodName, args] = methodMatch;
    const before = errorLine.substring(0, errorLine.indexOf(fullMatch));
    const after = errorLine.substring(errorLine.indexOf(fullMatch) + fullMatch.length);

    // Add a type assertion to the method call
    fileLines[line - 1] = `${before}(${objName} as any).${methodName}(${args})${after}`;
    return true;
  }

  return false;
}

/**
 * Fix unsafe assignment errors
 */
function fixUnsafeAssignment(error, fileLines) {
  const { line, message } = error;
  const errorLine = fileLines[line - 1];

  // Look for assignment patterns: variable = value
  const assignMatch = errorLine.match(/(\w+)\s*=\s*([^;]+)/);
  if (assignMatch) {
    const [fullMatch, varName, value] = assignMatch;
    const before = errorLine.substring(0, errorLine.indexOf(fullMatch));
    const after = errorLine.substring(errorLine.indexOf(fullMatch) + fullMatch.length);

    // Add a type assertion to the value
    fileLines[line - 1] = `${before}${varName} = ${value} as any${after}`;
    return true;
  }

  // Handle combineReducers case specifically
  if (errorLine.includes('combineReducers') && errorLine.includes('reducers')) {
    fileLines[line - 1] = errorLine.replace('combineReducers({', 'combineReducers<any>({');
    return true;
  }

  // Handle explicit any replacement
  if (message && (message.includes('@typescript-eslint/no-explicit-any') ||
    message.includes('Unexpected any'))) {
    // Replace 'any' with a more specific type if possible
    const anyMatch = errorLine.match(/:\s*any\b/);
    if (anyMatch) {
      // Replace with unknown which is more type-safe than any
      fileLines[line - 1] = errorLine.replace(/:\s*any\b/, ': unknown');
      return true;
    }
  }

  return false;
}

/**
 * Fix parsing errors (basic cases)
 */
function fixParsingError(error, fileLines) {
  const { line, message, filePath } = error;
  const errorLine = fileLines[line - 1] || '';

  // If no error line but we have a parsing error, it might be a global file issue
  if (!errorLine && message.includes("Parsing error")) {
    // For parserOptions.project errors in .js/.jsx files, convert to .ts/.tsx
    if (message.includes('"parserOptions.project" has been provided')) {
      if (filePath.endsWith('.js')) {
        const newPath = filePath.replace('.js', '.ts');
        try {
          fs.writeFileSync(newPath, fileLines.join('\n'));
          fs.unlinkSync(filePath);
          console.log(chalk.green(`Converted ${path.basename(filePath)} to ${path.basename(newPath)}`));
          return true;
        } catch (err) {
          console.log(chalk.yellow(`Failed to convert ${filePath}: ${err.message}`));
        }
      } else if (filePath.endsWith('.jsx')) {
        const newPath = filePath.replace('.jsx', '.tsx');
        try {
          fs.writeFileSync(newPath, fileLines.join('\n'));
          fs.unlinkSync(filePath);
          console.log(chalk.green(`Converted ${path.basename(filePath)} to ${path.basename(newPath)}`));
          return true;
        } catch (err) {
          console.log(chalk.yellow(`Failed to convert ${filePath}: ${err.message}`));
        }
      }
    }
    return false;
  }

  // Fix missing comma
  if (message.includes("',' expected")) {
    const lastNonSpaceChar = errorLine.trimRight().slice(-1);
    if (!/[,;]/.test(lastNonSpaceChar)) {
      fileLines[line - 1] = errorLine.trimRight() + ',';
      return true;
    }
  }

  // Fix missing semicolon
  if (message.includes("';' expected")) {
    const lastNonSpaceChar = errorLine.trimRight().slice(-1);
    if (!/[;]/.test(lastNonSpaceChar)) {
      fileLines[line - 1] = errorLine.trimRight() + ';';
      return true;
    }
  }

  // Fix missing closing brace
  if (message.includes("'}' expected")) {
    // Look for matching opening brace
    let braceCount = 0;
    for (let i = line - 1; i >= 0; i--) {
      const openBraces = (fileLines[i].match(/{/g) || []).length;
      const closeBraces = (fileLines[i].match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;

      if (braceCount > 0) {
        // We need to add a closing brace
        fileLines[line - 1] = errorLine + ' }';
        return true;
      }
    }
  }

  // Fix missing closing parenthesis
  if (message.includes("')' expected")) {
    // Look for matching opening parenthesis
    let parenCount = 0;
    for (let i = line - 1; i >= 0; i--) {
      const openParens = (fileLines[i].match(/\(/g) || []).length;
      const closeParens = (fileLines[i].match(/\)/g) || []).length;
      parenCount += openParens - closeParens;

      if (parenCount > 0) {
        // We need to add a closing parenthesis
        fileLines[line - 1] = errorLine + ')';
        return true;
      }
    }
  }

  // Fix missing colon in type definitions
  if (message.includes("':' expected")) {
    // Check if it's a type definition: "property: type"
    if (errorLine.match(/\b\w+\s*$/)) {
      fileLines[line - 1] = errorLine + ': any';
      return true;
    }
  }

  // Fix expression expected errors
  if (message.includes("Expression expected")) {
    // If in a TSX/JSX file and likely dealing with an empty expression
    if ((filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) && errorLine.includes('{}')) {
      fileLines[line - 1] = errorLine.replace('{}', '{/* */}');
      return true;
    }

    // If we have 'expression expected' after something that looks like a variable declaration
    if (errorLine.match(/\b(const|let|var)\s+\w+\s*=\s*$/)) {
      fileLines[line - 1] = errorLine + ' null';
      return true;
    }
  }

  // Fix identifier expected errors
  if (message.includes("Identifier expected")) {
    // Likely a syntax error in a declaration
    if (errorLine.match(/\b(interface|type|class|enum)\s+$/)) {
      fileLines[line - 1] = errorLine + 'Unnamed';
      return true;
    }
  }

  // Fix "A constructor, method, accessor, or property was expected" error 
  if (message.includes("A constructor, method, accessor, or property was expected")) {
    // This is often a class syntax error
    if (errorLine.match(/\bclass\s+\w+\s*\{/)) {
      // Add a constructor if none exists
      const nextLine = line < fileLines.length ? fileLines[line] : '';
      if (!nextLine.includes('constructor')) {
        fileLines.splice(line, 0, '  constructor() {}');
        return true;
      }
    }
  }

  return false;
}

/**
 * Fix TypeScript project configuration errors
 */
function fixTsProjectError(error, fileLines) {
  const { filePath } = error;

  try {
    // Convert .js/.jsx files to .ts/.tsx
    if (filePath.endsWith('.js')) {
      const newPath = filePath.replace('.js', '.ts');
      fs.writeFileSync(newPath, fileLines.join('\n'), 'utf8');
      fs.unlinkSync(filePath);
      console.log(chalk.green(`Converted ${path.basename(filePath)} to ${path.basename(newPath)}`));
      return true;
    }
    else if (filePath.endsWith('.jsx')) {
      const newPath = filePath.replace('.jsx', '.tsx');
      fs.writeFileSync(newPath, fileLines.join('\n'), 'utf8');
      fs.unlinkSync(filePath);
      console.log(chalk.green(`Converted ${path.basename(filePath)} to ${path.basename(newPath)}`));
      return true;
    }
  } catch (err) {
    console.log(chalk.yellow(`Failed to convert ${filePath}: ${err.message}`));
  }

  return false;
}

/**
 * Fix expression expected errors
 */
function fixExpressionExpected(error, fileLines) {
  const { line, filePath } = error;
  const errorLine = fileLines[line - 1];

  // JSX empty expression
  if ((filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) && errorLine.includes('{}')) {
    fileLines[line - 1] = errorLine.replace('{}', '{/* Empty */}');
    return true;
  }

  // Incomplete variable declaration
  if (errorLine.match(/\b(const|let|var)\s+\w+\s*=\s*$/)) {
    fileLines[line - 1] = errorLine + ' null';
    return true;
  }

  // React component import missing
  if (errorLine.includes('import') && errorLine.includes('from')) {
    if (!errorLine.includes('{') && !errorLine.includes('*')) {
      const importMatch = errorLine.match(/import\s+(\w+)/);
      if (importMatch) {
        const componentName = importMatch[1];
        fileLines[line - 1] = `import { ${componentName} } from ${errorLine.split('from')[1].trim()}`;
        return true;
      }
    }
  }

  return false;
}

/**
 * Fix identifier expected errors
 */
function fixIdentifierExpected(error, fileLines) {
  const { line } = error;
  const errorLine = fileLines[line - 1];

  // Empty declaration
  if (errorLine.match(/\b(interface|type|class|enum)\s+$/)) {
    fileLines[line - 1] = errorLine + 'Unnamed';
    return true;
  }

  // Reserved word used as identifier
  const reservedWords = ['void', 'interface', 'type', 'class', 'enum', 'const', 'let', 'var', 'function'];
  for (const word of reservedWords) {
    if (errorLine.includes(word)) {
      // Replace reserved word with a safe alternative by adding underscore
      fileLines[line - 1] = errorLine.replace(new RegExp(`\\b${word}\\b(?!\\s*:|\\s*<|\\s*\\(|\\s*\\{)`), `_${word}`);
      return true;
    }
  }

  return false;
}

/**
 * Fix missing class method errors
 */
function fixMissingClassMethod(error, fileLines) {
  const { line } = error;
  const errorLine = fileLines[line - 1];

  // Class missing constructor
  if (errorLine.match(/\bclass\s+\w+\s*\{/)) {
    // Add a constructor after the opening brace
    const match = errorLine.match(/(\s*\{)/);
    if (match) {
      const indentation = errorLine.slice(0, errorLine.indexOf(match[0]));
      fileLines.splice(line, 0, `${indentation}  constructor() {}`);
      return true;
    }
  }

  return false;
}

/**
 * Fix JSX-specific errors
 */
function fixJsxError(error, fileLines) {
  const { line, message, filePath } = error;
  const errorLine = fileLines[line - 1];

  // JSX attribute missing value
  if (message.includes('expected') && errorLine.includes('=')) {
    const attrMatch = errorLine.match(/(\w+)=(?!\s*["'{])/);
    if (attrMatch) {
      const attr = attrMatch[1];
      fileLines[line - 1] = errorLine.replace(`${attr}=`, `${attr}=""`);
      return true;
    }
  }

  // Unclosed JSX tag
  if (message.includes('tag') && errorLine.match(/<\w+[^>]*$/)) {
    const tagMatch = errorLine.match(/<(\w+)[^>]*$/);
    if (tagMatch) {
      const tag = tagMatch[1];
      fileLines[line - 1] = errorLine + ` />`;
      return true;
    }
  }

  // JSX character escape issues
  if (message.includes('Did you mean')) {
    // Handle > character
    if (message.includes("Did you mean `{'>'}` or `&gt;`")) {
      fileLines[line - 1] = errorLine.replace(/>\s*(?=<|$)/, "{'>'}");
      return true;
    }

    // Handle } character
    if (message.includes("Did you mean `{'}'}` or `&rbrace;`")) {
      fileLines[line - 1] = errorLine.replace(/}\s*(?=<|$)/, "{'}'} ");
      return true;
    }

    // Handle < character
    if (message.includes("Did you mean `{'<'}` or `&lt;`")) {
      fileLines[line - 1] = errorLine.replace(/<\s*(?=\w)/, "{'<'}");
      return true;
    }
  }

  // Convert JSX file to TSX
  if (message.includes("Parsing error") && filePath.endsWith('.jsx')) {
    try {
      // Rename the file from .jsx to .tsx
      const newPath = filePath.replace('.jsx', '.tsx');
      fs.writeFileSync(newPath, fileLines.join('\n'), 'utf8');
      fs.unlinkSync(filePath);
      console.log(chalk.green(`Converted ${path.basename(filePath)} to ${path.basename(newPath)}`));
      return true;
    } catch (err) {
      console.log(chalk.yellow(`Failed to convert ${filePath}: ${err.message}`));
    }
  }

  return false;
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

      // Skip if file doesn't exist
      if (!fs.existsSync(filePath)) {
        console.log(chalk.yellow(`  File does not exist, skipping: ${relPath}`));
        continue;
      }

      // Check if file is readable
      try {
        fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
      } catch (err) {
        console.log(chalk.yellow(`  Cannot access file, skipping: ${relPath}`));
        continue;
      }

      let fixCount = 0;
      let fileContent;

      try {
        fileContent = fs.readFileSync(filePath, 'utf8');
      } catch (err) {
        console.log(chalk.yellow(`  Error reading file, skipping: ${relPath}`));
        continue;
      }

      let fileLines = fileContent.split('\n');
      const originalLines = [...fileLines]; // Make a copy for comparison

      // Sort errors by line number in descending order to prevent offset issues
      fileErrors.sort((a, b) => b.line - a.line);

      for (const error of fileErrors) {
        try {
          const fixed = fixError(error);

          if (fixed) {
            fixCount++;
            stats.fixedErrors++;
          } else {
            console.log(chalk.gray(`  Could not fix: ${error.message || error.ruleId}`));
            stats.unfixableErrors++;
          }
        } catch (err) {
          console.log(chalk.yellow(`  Error fixing: ${error.message || error.ruleId}`));
          console.log(chalk.gray(`    ${err.message}`));
          stats.unfixableErrors++;
        }
      }

      // Only write if changes were made
      if (JSON.stringify(fileLines) !== JSON.stringify(originalLines)) {
        try {
          fs.writeFileSync(filePath, fileLines.join('\n'));
          stats.filesFixed.add(filePath);
          console.log(chalk.green(`  ✓ Applied ${fixCount} fixes to ${relPath}`));
        } catch (err) {
          console.log(chalk.red(`  Error writing file ${relPath}: ${err.message}`));
        }
      } else if (fixCount > 0) {
        // If we claim to have fixed something but the file is unchanged, this is an error in our code
        console.log(chalk.yellow(`  ⚠ Fixed ${fixCount} errors but file was not changed, possible bug in script`));
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

    // Run ESLint check
    console.log(chalk.blue('\n🔍 Checking for remaining ESLint errors...'));
    try {
      execSync('npx eslint src --ext .ts,.tsx,.js,.jsx --format compact', { stdio: 'pipe', cwd: ROOT_DIR });
      console.log(chalk.green('✓ No ESLint errors found!'));
    } catch (error) {
      const errorOutput = error.stdout?.toString() || error.message;
      const errorLines = errorOutput.split('\n');
      const totalErrors = errorLines.length;

      console.log(chalk.yellow(`${totalErrors} ESLint errors still remain. Sample errors:`));
      console.log(chalk.gray(errorLines.slice(0, 10).join('\n')));
      console.log(chalk.yellow('\nSome complex errors may need manual intervention.'));
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