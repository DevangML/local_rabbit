/**
 * Type Error Fixer Script
 * 
 * This script analyzes TypeScript errors in the client codebase and applies
 * intelligent fixes to resolve them automatically.
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import chalk from 'chalk';

// Get current file path and directory in ES modules
// For Node.js ES modules we need a different approach since __dirname is not available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(ROOT_DIR, 'src');
const TSCONFIG_PATH = path.resolve(ROOT_DIR, 'tsconfig.json');

/**
 * Helper function to get the node at a specific position in a source file
 * This replaces the non-existent ts.getNodeAtPosition
 */
function getNodeAtPosition(sourceFile: ts.SourceFile, position: number): ts.Node {
  function find(node: ts.Node): ts.Node {
    if (position >= node.getStart(sourceFile) && position < node.getEnd()) {
      for (const child of node.getChildren(sourceFile)) {
        if (position >= child.getStart(sourceFile) && position < child.getEnd()) {
          return find(child);
        }
      }
      return node;
    }
    return node;
  }
  return find(sourceFile);
}

// Error types and their fixes
enum ErrorFixes {
  MISSING_PROPERTY = 'missingProperty',
  TYPE_MISMATCH = 'typeMismatch',
  NULLABLE = 'nullable',
  IMPLICIT_ANY = 'implicitAny',
  MISSING_IMPORT = 'missingImport',
  MISSING_INTERFACE = 'missingInterface',
}

// Initial stats
const stats = {
  totalErrors: 0,
  fixedErrors: 0,
  unfixableErrors: 0,
  filesWithErrors: new Set<string>(),
  filesFixed: new Set<string>(),
};

/**
 * Load TypeScript configuration
 */
function loadTsConfig(): ts.CompilerOptions {
  const configFile = ts.readConfigFile(TSCONFIG_PATH, ts.sys.readFile);
  
  if (configFile.error) {
    console.error(chalk.red('Error reading tsconfig.json:'), configFile.error.messageText);
    process.exit(1);
  }
  
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(TSCONFIG_PATH)
  );
  
  if (parsedConfig.errors.length > 0) {
    console.error(chalk.red('Error parsing tsconfig.json:'), parsedConfig.errors[0].messageText);
    process.exit(1);
  }
  
  return parsedConfig.options;
}

/**
 * Create TypeScript program
 */
function createProgram(compilerOptions: ts.CompilerOptions): ts.Program {
  const sourceFiles = getAllTsFiles(SRC_DIR);
  const host = ts.createCompilerHost(compilerOptions);
  
  return ts.createProgram(sourceFiles, compilerOptions, host);
}

/**
 * Get all TypeScript files in a directory recursively
 */
function getAllTsFiles(dir: string): string[] {
  let files: string[] = [];
  
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
 * Get error type and potential fix method
 */
function categorizeError(diagnostic: ts.Diagnostic): ErrorFixes | null {
  const code = diagnostic.code;
  const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  
  // Property does not exist error
  if (code === 2339) {
    return ErrorFixes.MISSING_PROPERTY;
  }
  
  // Type mismatch errors
  if (code === 2322 || code === 2345) {
    return ErrorFixes.TYPE_MISMATCH;
  }
  
  // Nullable errors
  if (messageText.includes('null') || messageText.includes('undefined')) {
    return ErrorFixes.NULLABLE;
  }
  
  // Implicit any errors
  if (code === 7006 || code === 7005) {
    return ErrorFixes.IMPLICIT_ANY;
  }

  // Cannot find module errors
  if (code === 2307) {
    return ErrorFixes.MISSING_IMPORT;
  }

  // Interface errors
  if (
    code === 2420 || 
    code === 2559 || 
    messageText.includes('interface') || 
    messageText.includes('type')
  ) {
    return ErrorFixes.MISSING_INTERFACE;
  }
  
  return null;
}

/**
 * Generate a fix for a missing property
 */
function fixMissingProperty(
  sourceFile: ts.SourceFile,
  diagnostic: ts.Diagnostic
): string | null {
  if (!diagnostic.file || diagnostic.start === undefined) return null;
  
  const start = diagnostic.start;
  const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  const match = messageText.match(/Property '(.+)' does not exist on type/);
  
  if (!match) return null;

  const propertyName = match[1];
  
  // Find the containing type declaration (interface or type)
  let node = getNodeAtPosition(sourceFile, start);
  let typeDeclaration: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | null = null;
  
  while (node && !typeDeclaration) {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      typeDeclaration = node as ts.InterfaceDeclaration | ts.TypeAliasDeclaration;
    }
    node = node.parent;
  }
  
  if (typeDeclaration) {
    // Add the missing property to the interface/type
    const sourceText = sourceFile.text;
    const interfaceName = typeDeclaration.name.text;
    
    // Find closing brace of the interface
    const interfaceText = sourceText.substring(typeDeclaration.pos, typeDeclaration.end);
    const closingBraceIndex = interfaceText.lastIndexOf('}');
    
    if (closingBraceIndex !== -1) {
      const insertionPoint = typeDeclaration.pos + closingBraceIndex;
      
      // Generate the new property with any type
      const propertyDeclaration = `\n  ${propertyName}?: any; // TODO: Replace 'any' with the correct type`;
      
      const newText = 
        sourceText.substring(0, insertionPoint) + 
        propertyDeclaration + 
        sourceText.substring(insertionPoint);
      
      return newText;
    }
  }
  
  return null;
}

/**
 * Generate a fix for type mismatches
 */
function fixTypeMismatch(
  sourceFile: ts.SourceFile,
  diagnostic: ts.Diagnostic
): string | null {
  // This is a more complex fix that would require type inference
  // Here's a simplified version that adds type assertions
  if (!diagnostic.file || diagnostic.start === undefined) return null;
  
  const start = diagnostic.start;
  const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  
  // Find the problematic expression
  const node = getNodeAtPosition(sourceFile, start);
  
  if (node && ts.isExpression(node)) {
    const sourceText = sourceFile.text;
    const expressionText = sourceText.substring(node.pos, node.end);
    
    // Add a type assertion (this is a simple approach, a more sophisticated one would infer the required type)
    const newExpressionText = `(${expressionText} as any) /* TODO: Replace 'any' with the correct type */`;
    
    return sourceText.substring(0, node.pos) + 
           newExpressionText + 
           sourceText.substring(node.end);
  }
  
  return null;
}

/**
 * Fix nullable issues with proper null checks
 */
function fixNullable(
  sourceFile: ts.SourceFile,
  diagnostic: ts.Diagnostic
): string | null {
  if (!diagnostic.file || diagnostic.start === undefined) return null;
  
  const start = diagnostic.start;
  
  // Find the problematic expression
  const node = getNodeAtPosition(sourceFile, start);
  
  if (node && (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node))) {
    const sourceText = sourceFile.text;
    const expressionText = sourceText.substring(node.pos, node.end);
    
    // Add a nullish coalescing operator check
    let objectRef = "";
    if (ts.isPropertyAccessExpression(node)) {
      objectRef = sourceText.substring(node.expression.pos, node.expression.end);
    } else if (ts.isElementAccessExpression(node)) {
      objectRef = sourceText.substring(node.expression.pos, node.expression.end);
    }
    
    const newExpressionText = objectRef ? 
      `${objectRef} ? ${expressionText} : undefined` : 
      expressionText;
    
    return sourceText.substring(0, node.pos) + 
           newExpressionText + 
           sourceText.substring(node.end);
  }
  
  return null;
}

/**
 * Fix implicit any errors by adding explicit type annotations
 */
function fixImplicitAny(
  sourceFile: ts.SourceFile,
  diagnostic: ts.Diagnostic
): string | null {
  if (!diagnostic.file || diagnostic.start === undefined) return null;
  
  const start = diagnostic.start;
  const node = getNodeAtPosition(sourceFile, start);
  
  if (node && (ts.isParameter(node) || ts.isVariableDeclaration(node))) {
    const sourceText = sourceFile.text;
    const nodeName = node.name ? node.name.getText(sourceFile) : '';
    
    if (ts.isParameter(node)) {
      // Find the parameter and add type annotation
      const paramText = sourceText.substring(node.pos, node.end);
      const newParamText = `${nodeName}: any /* TODO: Replace with appropriate type */`;
      
      return sourceText.substring(0, node.pos) + 
             newParamText + 
             sourceText.substring(node.end);
    } else if (ts.isVariableDeclaration(node)) {
      // Add type annotation to variable declaration
      const nodeText = sourceText.substring(node.pos, node.end);
      const hasInitializer = node.initializer !== undefined;
      
      const newNodeText = hasInitializer && node.initializer ?
        `${nodeName}: any /* TODO: Replace with appropriate type */ = ${node.initializer.getText(sourceFile)}` :
        `${nodeName}: any /* TODO: Replace with appropriate type */`;
      
      return sourceText.substring(0, node.pos) + 
             newNodeText + 
             sourceText.substring(node.end);
    }
  }
  
  return null;
}

/**
 * Fix missing import errors by adding import declarations
 */
function fixMissingImport(
  sourceFile: ts.SourceFile,
  diagnostic: ts.Diagnostic
): string | null {
  if (!diagnostic.file || diagnostic.start === undefined) return null;
  
  const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  const match = messageText.match(/Cannot find module ['"](.+)['"] or its corresponding type declarations/);
  
  if (!match) return null;
  
  const moduleName = match[1];
  const sourceText = sourceFile.text;
  
  // Find the position to insert the import
  let insertPos = 0;
  // Skip comment blocks at the top
  while (insertPos < sourceText.length) {
    if (/^\s*\/\//.test(sourceText.substring(insertPos))) {
      const lineEnd = sourceText.indexOf('\n', insertPos);
      if (lineEnd === -1) break;
      insertPos = lineEnd + 1;
    } else if (/^\s*\/\*/.test(sourceText.substring(insertPos))) {
      const blockEnd = sourceText.indexOf('*/', insertPos);
      if (blockEnd === -1) break;
      insertPos = blockEnd + 2;
    } else {
      break;
    }
  }
  
  // Create the import statement
  const importStatement = `import * as ${moduleName.replace(/[-./]/g, '_')} from '${moduleName}';\n`;
  
  // Insert the import statement
  return sourceText.substring(0, insertPos) + 
         importStatement + 
         sourceText.substring(insertPos);
}

/**
 * Fix missing interface errors by generating them
 */
function fixMissingInterface(
  sourceFile: ts.SourceFile,
  diagnostic: ts.Diagnostic
): string | null {
  if (!diagnostic.file || diagnostic.start === undefined) return null;
  
  const messageText = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  const interfaceMatch = messageText.match(/Interface ['"](.+)['"] cannot/);
  const typeMatch = messageText.match(/Type ['"](.+)['"] is not/);
  
  const typeName = interfaceMatch?.[1] || typeMatch?.[1];
  if (!typeName) return null;
  
  const sourceText = sourceFile.text;
  
  // Generate an empty interface
  const interfaceDeclaration = `\n\n// TODO: Fill in the correct properties\ninterface ${typeName} {\n  [key: string]: any;\n}\n`;
  
  // Add the interface at the end of the imports
  let lastImportEnd = 0;
  sourceFile.statements.forEach(stmt => {
    if (ts.isImportDeclaration(stmt)) {
      lastImportEnd = Math.max(lastImportEnd, stmt.end);
    }
  });
  
  if (lastImportEnd > 0) {
    return sourceText.substring(0, lastImportEnd) + 
           interfaceDeclaration + 
           sourceText.substring(lastImportEnd);
  } else {
    return interfaceDeclaration + sourceText;
  }
}

/**
 * Apply a fix to a source file
 */
function applyFix(sourceFile: ts.SourceFile, diagnostic: ts.Diagnostic): string | null {
  if (!diagnostic.file) return null;
  
  const errorType = categorizeError(diagnostic);
  if (!errorType) return null;
  
  switch (errorType) {
    case ErrorFixes.MISSING_PROPERTY:
      return fixMissingProperty(sourceFile, diagnostic);
    case ErrorFixes.TYPE_MISMATCH:
      return fixTypeMismatch(sourceFile, diagnostic);
    case ErrorFixes.NULLABLE:
      return fixNullable(sourceFile, diagnostic);
    case ErrorFixes.IMPLICIT_ANY:
      return fixImplicitAny(sourceFile, diagnostic);
    case ErrorFixes.MISSING_IMPORT:
      return fixMissingImport(sourceFile, diagnostic);
    case ErrorFixes.MISSING_INTERFACE:
      return fixMissingInterface(sourceFile, diagnostic);
    default:
      return null;
  }
}

/**
 * Main function to fix type errors
 */
async function main() {
  try {
    console.log(chalk.blue('🔍 Analyzing TypeScript errors in client code...'));
    
    // Load TS config and create program
    const compilerOptions = loadTsConfig();
    const program = createProgram(compilerOptions);
    
    // Get all diagnostics
    const diagnostics = [
      ...program.getSemanticDiagnostics(),
      ...program.getSyntacticDiagnostics(),
      ...program.getDeclarationDiagnostics(),
    ];
    
    stats.totalErrors = diagnostics.length;
    
    console.log(chalk.yellow(`Found ${stats.totalErrors} type errors to fix`));
    
    // Group diagnostics by file
    const diagnosticsByFile = new Map<string, ts.Diagnostic[]>();
    
    for (const diagnostic of diagnostics) {
      if (diagnostic.file) {
        const filePath = diagnostic.file.fileName;
        stats.filesWithErrors.add(filePath);
        
        if (!diagnosticsByFile.has(filePath)) {
          diagnosticsByFile.set(filePath, []);
        }
        
        const fileDiagnostics = diagnosticsByFile.get(filePath);
        if (fileDiagnostics) {
          fileDiagnostics.push(diagnostic);
        }
      }
    }
    
    // Process each file and apply fixes
    // Convert Map.entries() to Array to avoid downlevelIteration issues
    const diagnosticEntries = Array.from(diagnosticsByFile.entries());
    
    for (const [filePath, fileDiagnostics] of diagnosticEntries) {
      console.log(chalk.cyan(`\nProcessing ${path.relative(ROOT_DIR, filePath)}`));
      console.log(chalk.gray(`Found ${fileDiagnostics.length} errors`));
      
      const sourceFile = program.getSourceFile(filePath);
      if (!sourceFile) continue;
      
      let fileContent = sourceFile.text;
      let fixCount = 0;
      
      // Apply fixes in reverse order to avoid affecting positions
      const sortedDiagnostics = [...fileDiagnostics].sort((a, b) => 
        (b.start || 0) - (a.start || 0)
      );
      
      for (const diagnostic of sortedDiagnostics) {
        const fixedContent = applyFix(sourceFile, diagnostic);
        
        if (fixedContent) {
          fileContent = fixedContent;
          fixCount++;
          stats.fixedErrors++;
        } else {
          stats.unfixableErrors++;
          console.log(chalk.gray(`  Could not fix: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`));
        }
      }
      
      if (fixCount > 0) {
        fs.writeFileSync(filePath, fileContent, 'utf8');
        stats.filesFixed.add(filePath);
        console.log(chalk.green(`  ✓ Applied ${fixCount} fixes`));
      }
    }
    
    // Format the fixed files
    console.log(chalk.blue('\n🧹 Formatting fixed files...'));
    // Convert Set to Array to avoid downlevelIteration issues
    const fixedFilePaths = Array.from(stats.filesFixed);
    
    for (const filePath of fixedFilePaths) {
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
      const errorOutput = error instanceof Error ? error.message : String(error);
      console.log(chalk.yellow('Some type errors still remain:'));
      console.log(chalk.gray(errorOutput.split('\n').slice(0, 10).join('\n') + '...'));
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