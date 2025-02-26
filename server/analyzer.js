const fs = require('fs');
const path = require('path');
const jscodeshift = require('jscodeshift');
const escomplex = require('escomplex');
const { ESLint } = require('eslint');

class CodeAnalyzer {
  constructor(repoPath) {
    this.repoPath = repoPath;
    this.eslint = new ESLint({
      useEslintrc: false,
      overrideConfig: {
        extends: ['eslint:recommended'],
        parserOptions: {
          ecmaVersion: 2021,
          sourceType: 'module'
        }
      }
    });
  }

  async analyzeImpact(files, oldBranch, newBranch, gitService) {
    const results = [];

    for (const file of files) {
      if (!file.newPath.endsWith('.js') && !file.newPath.endsWith('.jsx')) {
        continue;
      }

      const oldContent = await gitService.getFileContent(oldBranch, file.oldPath);
      const newContent = await gitService.getFileContent(newBranch, file.newPath);

      if (!oldContent || !newContent) {
        continue;
      }

      // Analyze function and variable changes
      const functionsChanged = this.detectFunctionChanges(oldContent, newContent);
      const variablesChanged = this.detectVariableChanges(oldContent, newContent);
      
      // Analyze logical flow changes
      const flowChanges = this.detectFlowChanges(oldContent, newContent);

      results.push({
        file: file.newPath,
        functionsChanged,
        variablesChanged,
        flowChanges,
        impactLevel: this.calculateImpactLevel(functionsChanged, variablesChanged, flowChanges)
      });
    }

    return results;
  }

  async analyzeQuality(files, oldBranch, newBranch, gitService) {
    const results = [];

    for (const file of files) {
      if (!file.newPath.endsWith('.js') && !file.newPath.endsWith('.jsx')) {
        continue;
      }

      const oldContent = await gitService.getFileContent(oldBranch, file.oldPath);
      const newContent = await gitService.getFileContent(newBranch, file.newPath);

      if (!oldContent || !newContent) {
        continue;
      }

      // Calculate complexity metrics
      const oldComplexity = this.calculateComplexity(oldContent);
      const newComplexity = this.calculateComplexity(newContent);

      // Run ESLint
      const oldLintResults = await this.runLint(oldContent);
      const newLintResults = await this.runLint(newContent);

      results.push({
        file: file.newPath,
        complexityChange: {
          cyclomatic: newComplexity.cyclomatic - oldComplexity.cyclomatic,
          maintainability: newComplexity.maintainability - oldComplexity.maintainability,
          halstead: {
            difficulty: newComplexity.halstead.difficulty - oldComplexity.halstead.difficulty,
            volume: newComplexity.halstead.volume - oldComplexity.halstead.volume
          }
        },
        lintResults: {
          old: {
            errors: oldLintResults.filter(r => r.severity === 2).length,
            warnings: oldLintResults.filter(r => r.severity === 1).length
          },
          new: {
            errors: newLintResults.filter(r => r.severity === 2).length,
            warnings: newLintResults.filter(r => r.severity === 1).length
          }
        },
        qualityAssessment: this.assessQualityChange(
          oldComplexity, 
          newComplexity, 
          oldLintResults, 
          newLintResults
        )
      });
    }

    return results;
  }

  async genericReview(files, oldBranch, newBranch, gitService) {
    const results = [];

    for (const file of files) {
      const oldContent = await gitService.getFileContent(oldBranch, file.oldPath);
      const newContent = await gitService.getFileContent(newBranch, file.newPath);

      if (!oldContent || !newContent) {
        continue;
      }

      const fileExtension = path.extname(file.newPath).toLowerCase();
      const comments = [];

      // Generic patterns to check for
      if (fileExtension === '.js' || fileExtension === '.jsx') {
        // Check for console.log statements
        if (newContent.includes('console.log') && !oldContent.includes('console.log')) {
          comments.push({
            type: 'warning',
            line: this.findLineNumber(newContent, 'console.log'),
            message: 'Debug console.log statement detected. Consider removing before merging.'
          });
        }

        // Check for TODO comments
        const todoMatches = newContent.match(/\/\/\s*TODO/g);
        if (todoMatches) {
          comments.push({
            type: 'info',
            line: this.findLineNumber(newContent, '// TODO'),
            message: `${todoMatches.length} TODO comment(s) found. Consider addressing them.`
          });
        }

        // Check for hardcoded values
        const hardcodedMatches = this.detectHardcodedValues(newContent);
        if (hardcodedMatches.length > 0) {
          comments.push({
            type: 'suggestion',
            line: hardcodedMatches[0].line,
            message: 'Consider extracting hardcoded values to constants or configuration.'
          });
        }
      }

      // File size checks
      if (newContent.length > 5000 && oldContent.length <= 5000) {
        comments.push({
          type: 'warning',
          line: 1,
          message: 'File has grown quite large. Consider breaking it into smaller modules.'
        });
      }

      results.push({
        file: file.newPath,
        comments
      });
    }

    return results;
  }

  // Helper methods

  calculateComplexity(code) {
    try {
      const analysis = escomplex.analyse(code);
      return {
        cyclomatic: analysis.aggregate.cyclomatic,
        maintainability: analysis.maintainability,
        halstead: {
          difficulty: analysis.aggregate.halstead.difficulty,
          volume: analysis.aggregate.halstead.volume
        }
      };
    } catch (error) {
      console.error('Error calculating complexity:', error);
      return {
        cyclomatic: 0,
        maintainability: 0,
        halstead: { difficulty: 0, volume: 0 }
      };
    }
  }

  async runLint(code) {
    try {
      const results = await this.eslint.lintText(code);
      return results[0]?.messages || [];
    } catch (error) {
      console.error('Error running ESLint:', error);
      return [];
    }
  }

  detectFunctionChanges(oldCode, newCode) {
    try {
      // Use jscodeshift to parse and analyze function definitions
      const oldAst = jscodeshift(oldCode);
      const newAst = jscodeshift(newCode);

      const oldFunctions = this.extractFunctions(oldAst);
      const newFunctions = this.extractFunctions(newAst);

      const added = newFunctions.filter(f => !oldFunctions.some(of => of.name === f.name));
      const removed = oldFunctions.filter(f => !newFunctions.some(nf => nf.name === f.name));
      const modified = newFunctions.filter(f => {
        const oldFunc = oldFunctions.find(of => of.name === f.name);
        return oldFunc && oldFunc.body !== f.body;
      });

      return { added, removed, modified };
    } catch (error) {
      console.error('Error detecting function changes:', error);
      return { added: [], removed: [], modified: [] };
    }
  }

  extractFunctions(ast) {
    const functions = [];

    // Extract function declarations
    ast.find(jscodeshift.FunctionDeclaration).forEach(path => {
      functions.push({
        name: path.node.id.name,
        body: path.node.body.value
      });
    });

    // Extract arrow functions and function expressions with variable declarations
    ast.find(jscodeshift.VariableDeclarator).forEach(path => {
      if (path.node.init && 
          (path.node.init.type === 'ArrowFunctionExpression' || 
           path.node.init.type === 'FunctionExpression')) {
        functions.push({
          name: path.node.id.name,
          body: path.node.init.body.value
        });
      }
    });

    return functions;
  }

  detectVariableChanges(oldCode, newCode) {
    try {
      const oldAst = jscodeshift(oldCode);
      const newAst = jscodeshift(newCode);

      const oldVariables = this.extractVariables(oldAst);
      const newVariables = this.extractVariables(newAst);

      const added = newVariables.filter(v => !oldVariables.some(ov => ov.name === v.name));
      const removed = oldVariables.filter(v => !newVariables.some(nv => nv.name === v.name));
      const modified = newVariables.filter(v => {
        const oldVar = oldVariables.find(ov => ov.name === v.name);
        return oldVar && oldVar.value !== v.value;
      });

      return { added, removed, modified };
    } catch (error) {
      console.error('Error detecting variable changes:', error);
      return { added: [], removed: [], modified: [] };
    }
  }

  extractVariables(ast) {
    const variables = [];

    ast.find(jscodeshift.VariableDeclarator).forEach(path => {
      if (path.node.init && path.node.init.type !== 'ArrowFunctionExpression' && 
          path.node.init.type !== 'FunctionExpression') {
        variables.push({
          name: path.node.id.name,
          value: path.node.init.value
        });
      }
    });

    return variables;
  }

  detectFlowChanges(oldCode, newCode) {
    try {
      const oldAst = jscodeshift(oldCode);
      const newAst = jscodeshift(newCode);

      // Check for changes in control flow statements
      const oldFlowStatements = this.extractFlowStatements(oldAst);
      const newFlowStatements = this.extractFlowStatements(newAst);

      // Count differences in flow statements
      const addedIf = newFlowStatements.if - oldFlowStatements.if;
      const addedLoop = (newFlowStatements.for + newFlowStatements.while) - 
                         (oldFlowStatements.for + oldFlowStatements.while);
      const addedSwitch = newFlowStatements.switch - oldFlowStatements.switch;
      const addedTryCatch = newFlowStatements.try - oldFlowStatements.try;

      return {
        ifStatements: { count: newFlowStatements.if, added: addedIf },
        loopStatements: { 
          count: newFlowStatements.for + newFlowStatements.while, 
          added: addedLoop 
        },
        switchStatements: { count: newFlowStatements.switch, added: addedSwitch },
        tryCatchStatements: { count: newFlowStatements.try, added: addedTryCatch }
      };
    } catch (error) {
      console.error('Error detecting flow changes:', error);
      return {
        ifStatements: { count: 0, added: 0 },
        loopStatements: { count: 0, added: 0 },
        switchStatements: { count: 0, added: 0 },
        tryCatchStatements: { count: 0, added: 0 }
      };
    }
  }

  extractFlowStatements(ast) {
    const counts = { if: 0, for: 0, while: 0, switch: 0, try: 0 };

    ast.find(jscodeshift.IfStatement).forEach(() => counts.if++);
    ast.find(jscodeshift.ForStatement).forEach(() => counts.for++);
    ast.find(jscodeshift.WhileStatement).forEach(() => counts.while++);
    ast.find(jscodeshift.SwitchStatement).forEach(() => counts.switch++);
    ast.find(jscodeshift.TryStatement).forEach(() => counts.try++);

    return counts;
  }

  calculateImpactLevel(functionsChanged, variablesChanged, flowChanges) {
    // Simple impact scoring algorithm
    let impactScore = 0;

    // Function changes impact
    impactScore += functionsChanged.added.length * 2;
    impactScore += functionsChanged.removed.length * 3;
    impactScore += functionsChanged.modified.length * 2;

    // Variable changes impact
    impactScore += variablesChanged.added.length;
    impactScore += variablesChanged.removed.length * 2;
    impactScore += variablesChanged.modified.length;

    // Flow changes impact
    impactScore += Math.abs(flowChanges.ifStatements.added) * 2;
    impactScore += Math.abs(flowChanges.loopStatements.added) * 3;
    impactScore += Math.abs(flowChanges.switchStatements.added) * 2;
    impactScore += Math.abs(flowChanges.tryCatchStatements.added) * 2;

    // Categorize impact
    if (impactScore <= 5) return 'Low';
    if (impactScore <= 15) return 'Medium';
    return 'High';
  }

  assessQualityChange(oldComplexity, newComplexity, oldLintResults, newLintResults) {
    const complexityDiff = newComplexity.cyclomatic - oldComplexity.cyclomatic;
    const maintainabilityDiff = newComplexity.maintainability - oldComplexity.maintainability;
    const oldErrorCount = oldLintResults.filter(r => r.severity === 2).length;
    const newErrorCount = newLintResults.filter(r => r.severity === 2).length;
    const oldWarningCount = oldLintResults.filter(r => r.severity === 1).length;
    const newWarningCount = newLintResults.filter(r => r.severity === 1).length;

    // Quality scoring
    let qualityScore = 0;

    // Complexity - lower is better
    if (complexityDiff < 0) qualityScore += 2;
    else if (complexityDiff > 0) qualityScore -= 2;

    // Maintainability - higher is better
    if (maintainabilityDiff > 0) qualityScore += 3;
    else if (maintainabilityDiff < 0) qualityScore -= 3;

    // Linting errors - fewer is better
    if (newErrorCount < oldErrorCount) qualityScore += 3;
    else if (newErrorCount > oldErrorCount) qualityScore -= 3;

    // Linting warnings - fewer is better
    if (newWarningCount < oldWarningCount) qualityScore += 1;
    else if (newWarningCount > oldWarningCount) qualityScore -= 1;

    // Overall assessment
    if (qualityScore > 3) return 'Improved';
    if (qualityScore < -3) return 'Reduced';
    return 'Unchanged';
  }

  detectHardcodedValues(code) {
    const hardcoded = [];
    const lines = code.split('\n');

    // Simple regex patterns for hardcoded values
    const patterns = [
      { regex: /(['"])(?:(?=(\\?))\2.)*?\1/g, description: 'String literal' },
      { regex: /\b[0-9]+\b(?!\.[0-9])/g, description: 'Integer literal' },
      { regex: /\b[0-9]*\.[0-9]+\b/g, description: 'Floating point literal' }
    ];

    lines.forEach((line, index) => {
      for (const pattern of patterns) {
        const matches = line.match(pattern.regex);
        if (matches && !line.includes('import') && !line.trim().startsWith('//')) {
          hardcoded.push({
            line: index + 1,
            value: matches[0],
            description: pattern.description
          });
        }
      }
    });

    return hardcoded;
  }

  findLineNumber(content, search) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(search)) {
        return i + 1;
      }
    }
    return 1;
  }
}

module.exports = CodeAnalyzer;