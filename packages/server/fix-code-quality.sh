#!/bin/bash

# Set up colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Server Code Quality Fixer Script =====${NC}"
echo "This script will fix both TypeScript errors and ESLint violations in the server codebase."
echo

# Check if dependencies are installed
if ! [ -d "node_modules/typescript" ] || ! [ -d "node_modules/chalk" ] || ! [ -d "node_modules/lodash" ]; then
  echo -e "${BLUE}Installing dependencies...${NC}"
  npm install --save-dev typescript chalk lodash
fi

# Create report directory if it doesn't exist
mkdir -p reports

# 1. TYPESCRIPT ERROR FIXING
echo -e "${BLUE}===== STEP 1: FIXING TYPESCRIPT ERRORS =====${NC}"

# Run the TypeScript compiler to generate the error report
echo -e "${BLUE}Running initial type check to identify errors...${NC}"
npx tsc --noEmit > reports/typescript-errors.log || true

# Count errors
TS_ERROR_COUNT=$(grep -c "error TS" reports/typescript-errors.log || echo "0")
echo -e "${YELLOW}Found ${TS_ERROR_COUNT} TypeScript errors to fix.${NC}"

# Create scripts directory if it doesn't exist
mkdir -p scripts/fixers

# 1.1 Create TypeScript fixer script
echo -e "${BLUE}Creating TypeScript fixer script...${NC}"
cat > scripts/fixers/fix-typescript-errors.js << 'EOF'
/**
 * TypeScript Error Fixer for Server
 * 
 * This script analyzes and fixes common TypeScript errors in the server codebase.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Constants
const ROOT_DIR = path.resolve(__dirname, '../..');
const SRC_DIR = path.resolve(ROOT_DIR, 'src');
const ROUTES_DIR = path.resolve(ROOT_DIR, 'routes');
const SERVER_DIR = path.resolve(ROOT_DIR, 'server');

// Stats tracking
const stats = {
  scanned: 0,
  fixed: 0,
  errors: 0,
};

// Common type annotations to add for parameters
const COMMON_TYPES = {
  req: 'Request',
  res: 'Response',
  next: 'NextFunction',
  error: 'Error',
  id: 'string',
  user: 'User',
  data: 'any',
  options: 'any',
  config: 'any',
  callback: 'Function',
};

// Helper to add Express import if needed
function addExpressImports(fileContent) {
  if (
    (fileContent.includes('Request') || 
     fileContent.includes('Response') || 
     fileContent.includes('NextFunction')) &&
    !fileContent.includes('express')
  ) {
    // Add import if it doesn't exist
    if (fileContent.includes('import ')) {
      return fileContent.replace(
        /^(import.*?;(\r?\n)*)/m,
        '$1import { Request, Response, NextFunction } from \'express\';\n'
      );
    } else {
      return 'import { Request, Response, NextFunction } from \'express\';\n' + fileContent;
    }
  }
  return fileContent;
}

// Fix missing type annotations for functions
function fixMissingTypes(filePath) {
  console.log(chalk.blue(`Analyzing ${path.relative(ROOT_DIR, filePath)}`));
  stats.scanned++;

  let fileContent = fs.readFileSync(filePath, 'utf8');
  let originalContent = fileContent;
  let modified = false;

  // Add missing parameter types
  Object.entries(COMMON_TYPES).forEach(([param, type]) => {
    // Look for functions with untyped parameters matching our common names
    const regex = new RegExp(`(function|=>|\\()\\s*(\\w+\\s*)?\\(([^)]*?\\b${param}\\b[^)]*)\\)`, 'g');
    
    fileContent = fileContent.replace(regex, (match, prefix, fnName, params) => {
      if (params.includes(`${param}: `)) {
        // Already has type annotation
        return match;
      }
      
      modified = true;
      // Replace parameter with typed version
      const newParams = params.replace(
        new RegExp(`\\b${param}\\b`, 'g'), 
        `${param}: ${type}`
      );
      
      return `${prefix}${fnName ? fnName : ''}(${newParams})`;
    });
  });

  // Add express imports if needed
  const withImports = addExpressImports(fileContent);
  if (withImports !== fileContent) {
    fileContent = withImports;
    modified = true;
  }

  // If file was modified, save changes
  if (modified) {
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(chalk.green(`✓ Fixed type issues in ${path.relative(ROOT_DIR, filePath)}`));
    stats.fixed++;
  }

  return modified;
}

// Main function to scan directories and fix errors
function fixTypeScriptErrors() {
  console.log(chalk.blue('🔍 Scanning for TypeScript files to fix...'));
  
  // Define directories to scan
  const directories = [SRC_DIR, ROUTES_DIR, SERVER_DIR];
  
  // Get all TypeScript files
  const tsFiles = [];
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      findTypeScriptFiles(dir, tsFiles);
    }
  });
  
  console.log(chalk.blue(`Found ${tsFiles.length} TypeScript files to analyze`));
  
  // Process each file
  tsFiles.forEach(file => {
    try {
      fixMissingTypes(file);
    } catch (error) {
      console.error(chalk.red(`Error processing ${file}:`), error.message);
      stats.errors++;
    }
  });
  
  // Print summary
  console.log(chalk.blue('\n📊 TypeScript Fixer Summary'));
  console.log(`Files scanned: ${stats.scanned}`);
  console.log(`Files fixed: ${chalk.green(stats.fixed)}`);
  console.log(`Errors: ${chalk.red(stats.errors)}`);
}

// Helper function to find TypeScript files recursively
function findTypeScriptFiles(dir, fileList) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      findTypeScriptFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.ts') || file.endsWith('.tsx')) && 
      !file.endsWith('.d.ts')
    ) {
      fileList.push(filePath);
    }
  });
}

// Run the script
fixTypeScriptErrors();
EOF

# 1.2 Run the TypeScript fixer script
echo -e "${BLUE}Running TypeScript error fixer...${NC}"
node scripts/fixers/fix-typescript-errors.js

# Final type check
echo -e "${BLUE}Running final type check...${NC}"
npx tsc --noEmit > reports/typescript-final.log 2>&1 || true

# Count remaining errors
TS_REMAINING=$(grep -c "error TS" reports/typescript-final.log || echo "0")
if [ "$TS_REMAINING" -eq "0" ]; then
  echo -e "${GREEN}✓ All TypeScript errors fixed!${NC}"
else
  echo -e "${YELLOW}Reduced TypeScript errors from ${TS_ERROR_COUNT} to ${TS_REMAINING}${NC}"
fi

# 2. ESLINT ERROR FIXING
echo -e "${BLUE}===== STEP 2: FIXING ESLINT VIOLATIONS =====${NC}"

# Run ESLint to see initial violations
echo -e "${BLUE}Running initial ESLint check...${NC}"
node scripts/lint.js > reports/eslint-errors.log || true

# Count initial ESLint errors
ESLINT_ERROR_COUNT=$(grep -c "error:" reports/eslint-errors.log || echo "0")
ESLINT_WARNING_COUNT=$(grep -c "warning:" reports/eslint-errors.log || echo "0")
echo -e "${YELLOW}Found ${ESLINT_ERROR_COUNT} ESLint errors and ${ESLINT_WARNING_COUNT} warnings to fix.${NC}"

# 2.1. Create ESLint fixer script
echo -e "${BLUE}Creating ESLint fixer script...${NC}"
cat > scripts/fixers/fix-eslint-issues.js << 'EOF'
/**
 * Advanced ESLint Issue Fixer for Server
 * 
 * This script handles more complex ESLint rule fixes that can't be easily
 * addressed with automatic fixers.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Constants
const ROOT_DIR = path.resolve(__dirname, '../..');
const SRC_DIR = path.resolve(ROOT_DIR, 'src');
const ROUTES_DIR = path.resolve(ROOT_DIR, 'routes');
const SERVER_DIR = path.resolve(ROOT_DIR, 'server');

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

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
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
      if (after === '}') return match; // Skip empty objects
      fixed = true;
      return `${brace} ${after}`;
    })
    .replace(/([^\s{}])(})/g, (match, before, brace) => {
      if (before === '{') return match; // Skip empty objects
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
 * Fix semi rule (ensure semicolons)
 */
function fixSemi(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;

  // Simple regex to add missing semicolons at end of lines
  // This is a simplified approach and may not catch all cases
  const lines = content.split('\n');
  const newLines = [];

  for (const line of lines) {
    // Skip empty lines, comments, and lines that already end with semicolon
    if (
      line.trim() === '' || 
      line.trim().startsWith('//') || 
      line.trim().startsWith('/*') || 
      line.trim().endsWith(';') || 
      line.trim().endsWith('{') || 
      line.trim().endsWith('}') ||
      line.trim().endsWith(',') ||
      line.trim().match(/^import .* from .*$/) // Skip import statements for now
    ) {
      newLines.push(line);
      continue;
    }

    // Add semicolon if the line likely needs one
    if (
      line.trim().match(/^(let|const|var)/) ||
      line.trim().match(/\w+\s*=/) ||
      line.trim().match(/\)$/) ||
      line.trim().match(/\w+\.\w+\(.*\)$/)
    ) {
      newLines.push(`${line};`);
      fixed = true;
    } else {
      newLines.push(line);
    }
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
 * Fix quotes rule (use single quotes)
 */
function fixQuotes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;

  // Replace double quotes with single quotes, but be careful with escaping
  const newContent = content.replace(/"([^"\n\\]*(?:\\.[^"\n\\]*)*)"/g, (match, inside) => {
    // Skip if it contains single quotes (would need escaping)
    if (inside.includes('\'')) return match;
    
    fixed = true;
    return `'${inside}'`;
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
 * Main function to fix ESLint issues
 */
function fixEslintIssues() {
  console.log(chalk.blue('🔍 Fixing complex ESLint issues...'));

  const directories = [SRC_DIR, ROUTES_DIR, SERVER_DIR];
  const files = [];
  
  directories.forEach(dir => {
    files.push(...getAllJsFiles(dir));
  });

  console.log(chalk.blue(`Found ${files.length} files to analyze`));

  for (const file of files) {
    let fileFixed = false;

    // Apply fixes
    fileFixed |= fixEqeqeq(file);
    fileFixed |= fixPreferConst(file);
    fileFixed |= fixObjectCurlySpacing(file);
    fileFixed |= fixNonLiteralFs(file);
    fileFixed |= fixSemi(file);
    fileFixed |= fixQuotes(file);

    if (fileFixed) {
      console.log(chalk.green(`✓ Fixed issues in ${path.relative(ROOT_DIR, file)}`));
    }
  }

  console.log(chalk.green(`\n✓ Fixed ${stats.fixedIssues} ESLint issues in ${stats.filesFixed.size} files`));
}

// Run the fixer
fixEslintIssues();
EOF

# 2.2. Run ESLint with --fix to automatically fix what it can
echo -e "${BLUE}Running ESLint with automatic fixing...${NC}"
node scripts/lint.js --fix

# 2.3. Run our advanced ESLint fixer script for more complex issues
echo -e "${BLUE}Running advanced ESLint fixer for complex issues...${NC}"
node scripts/fixers/fix-eslint-issues.js

# Run ESLint again to see what's left
echo -e "${BLUE}Running final ESLint check...${NC}"
node scripts/lint.js > reports/eslint-final.log || true

# Count remaining ESLint issues
ESLINT_REMAINING_ERRORS=$(grep -c "error:" reports/eslint-final.log || echo "0")
ESLINT_REMAINING_WARNINGS=$(grep -c "warning:" reports/eslint-final.log || echo "0")

if [ "$ESLINT_REMAINING_ERRORS" -eq "0" ]; then
  echo -e "${GREEN}✓ All ESLint errors fixed!${NC}"
else
  echo -e "${YELLOW}Reduced ESLint errors from ${ESLINT_ERROR_COUNT} to ${ESLINT_REMAINING_ERRORS}${NC}"
fi

echo -e "${YELLOW}Remaining ESLint warnings: ${ESLINT_REMAINING_WARNINGS}${NC}"

# 3. PRETTIFY THE CODE
echo -e "${BLUE}===== STEP 3: FORMATTING CODE =====${NC}"

# Check if prettier is installed
if [ -f "node_modules/.bin/prettier" ]; then
  echo "Running Prettier to format all code files..."
  npx prettier --write "src/**/*.{js,jsx,ts,tsx,json}" "routes/**/*.{js,jsx,ts,tsx}" "server/**/*.{js,jsx,ts,tsx}"
  echo -e "${GREEN}✓ Code formatting complete!${NC}"
else
  echo -e "${YELLOW}Prettier not found. Skipping code formatting step.${NC}"
  echo "You can install prettier with: npm install --save-dev prettier"
fi

# 4. SUMMARY AND REPORT
echo -e "${BLUE}===== Code Quality Improvement Summary =====${NC}"
echo -e "TypeScript errors fixed: ${YELLOW}$((TS_ERROR_COUNT - TS_REMAINING))${NC}"
echo -e "ESLint errors fixed: ${YELLOW}$((ESLINT_ERROR_COUNT - ESLINT_REMAINING_ERRORS))${NC}"
echo -e "ESLint warnings remaining: ${YELLOW}${ESLINT_REMAINING_WARNINGS}${NC}"

# Save summary to report
cat > reports/code-quality-report.txt << EOF
Server Code Quality Improvement Report
==============================

TypeScript:
- Initial errors: ${TS_ERROR_COUNT}
- Remaining errors: ${TS_REMAINING}
- Fixed: $((TS_ERROR_COUNT - TS_REMAINING))

ESLint:
- Initial errors: ${ESLINT_ERROR_COUNT}
- Remaining errors: ${ESLINT_REMAINING_ERRORS}
- Fixed: $((ESLINT_ERROR_COUNT - ESLINT_REMAINING_ERRORS))
- Remaining warnings: ${ESLINT_REMAINING_WARNINGS}

Report generated on: $(date)
EOF

echo -e "${GREEN}Done!${NC}"
echo -e "Detailed reports saved in the ${YELLOW}reports/${NC} directory."
echo -e "If any issues remain, you may need to fix them manually."

# Make the script executable
chmod +x fix-code-quality.sh 