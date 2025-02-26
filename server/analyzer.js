const path = require('path');
const fs = require('fs').promises;

class CodeAnalyzer {
  constructor(repoPath) {
    this.repoPath = repoPath;
  }

  async analyzeImpact(diffFiles, fromBranch, toBranch, gitService) {
    const analysis = {
      summary: {
        totalFiles: 0,
        widgetChanges: 0,
        screenChanges: 0,
        modelChanges: 0,
        serviceChanges: 0,
        testChanges: 0,
        otherChanges: 0,
        addedTests: 0,
        modifiedTests: 0,
        stateManagementChanges: 0
      },
      details: {
        widgets: [],
        screens: [],
        models: [],
        services: [],
        tests: [],
        other: []
      },
      risks: []
    };

    // Filter for Dart files only
    const dartFiles = diffFiles.filter(file => file.newPath.endsWith('.dart'));
    analysis.summary.totalFiles = dartFiles.length;

    for (const file of dartFiles) {
      const fileType = file.fileType || 'other';
      const metadata = file.metadata || {};

      // Update summary counts
      switch (fileType) {
        case 'widget':
          analysis.summary.widgetChanges++;
          analysis.details.widgets.push({
            path: file.newPath,
            type: metadata.widgetTypes,
            hasStateManagement: metadata.hasStateManagement,
            additions: file.additions,
            deletions: file.deletions
          });
          break;
        case 'screen':
          analysis.summary.screenChanges++;
          analysis.details.screens.push({
            path: file.newPath,
            hasStateManagement: metadata.hasStateManagement,
            additions: file.additions,
            deletions: file.deletions
          });
          break;
        case 'model':
          analysis.summary.modelChanges++;
          analysis.details.models.push({
            path: file.newPath,
            additions: file.additions,
            deletions: file.deletions
          });
          break;
        case 'service':
          analysis.summary.serviceChanges++;
          analysis.details.services.push({
            path: file.newPath,
            hasStateManagement: metadata.hasStateManagement,
            additions: file.additions,
            deletions: file.deletions
          });
          break;
        case 'test':
          analysis.summary.testChanges++;
          if (file.additions > 0) {
            analysis.summary.addedTests++;
          }
          if (file.deletions > 0) {
            analysis.summary.modifiedTests++;
          }
          analysis.details.tests.push({
            path: file.newPath,
            additions: file.additions,
            deletions: file.deletions
          });
          break;
        default:
          analysis.summary.otherChanges++;
          analysis.details.other.push({
            path: file.newPath,
            additions: file.additions,
            deletions: file.deletions
          });
      }

      // Check for state management changes
      if (metadata.hasStateManagement) {
        analysis.summary.stateManagementChanges++;
      }

      // Risk analysis
      this.analyzeRisks(file, analysis.risks);
    }

    return analysis;
  }

  async analyzeQuality(diffFiles, fromBranch, toBranch, gitService) {
    const analysis = {
      summary: {
        totalFiles: 0,
        testCoverage: 0,
        widgetTestCoverage: 0,
        lintIssues: 0,
        complexityScore: 0
      },
      details: {
        untested: [],
        complexity: [],
        lintIssues: [],
        bestPractices: []
      },
      recommendations: []
    };

    // Filter for Dart files only
    const dartFiles = diffFiles.filter(file => file.newPath.endsWith('.dart'));
    analysis.summary.totalFiles = dartFiles.length;

    for (const file of dartFiles) {
      const metadata = file.metadata || {};
      const fileType = file.fileType || 'other';

      // Check for test coverage
      if (fileType === 'widget' || fileType === 'screen') {
        const testFile = file.newPath.replace('.dart', '_test.dart');
        try {
          await fs.access(path.join(this.repoPath, testFile));
          analysis.summary.testCoverage++;
          if (fileType === 'widget') {
            analysis.summary.widgetTestCoverage++;
          }
        } catch {
          analysis.details.untested.push(file.newPath);
        }
      }

      // Analyze code complexity
      const complexity = this.analyzeComplexity(file);
      if (complexity.score > 5) {
        analysis.details.complexity.push({
          path: file.newPath,
          score: complexity.score,
          reasons: complexity.reasons
        });
      }
      analysis.summary.complexityScore += complexity.score;

      // Check best practices
      this.analyzeBestPractices(file, analysis.details.bestPractices);
    }

    // Calculate percentages
    if (dartFiles.length > 0) {
      analysis.summary.testCoverage = (analysis.summary.testCoverage / dartFiles.length) * 100;
      analysis.summary.complexityScore = analysis.summary.complexityScore / dartFiles.length;
    }

    // Generate recommendations
    this.generateRecommendations(analysis);

    return analysis;
  }

  analyzeRisks(file, risks) {
    const metadata = file.metadata || {};

    // Check for large changes
    if (file.additions + file.deletions > 100) {
      risks.push({
        level: 'high',
        type: 'large_change',
        file: file.newPath,
        message: 'Large number of changes may need careful review'
      });
    }

    // Check state management changes
    if (metadata.hasStateManagement) {
      risks.push({
        level: 'medium',
        type: 'state_management',
        file: file.newPath,
        message: 'Changes to state management may affect app behavior'
      });
    }

    // Check missing tests
    if (!metadata.hasTests && (file.fileType === 'widget' || file.fileType === 'screen')) {
      risks.push({
        level: 'medium',
        type: 'missing_tests',
        file: file.newPath,
        message: 'Widget or screen changes without corresponding tests'
      });
    }
  }

  analyzeComplexity(file) {
    const complexity = {
      score: 0,
      reasons: []
    };

    // Analyze build method complexity
    if (file.metadata?.hasBuildMethod) {
      const buildMethodLines = file.chunks
        .flatMap(chunk => chunk.lines)
        .filter(line => line.content.includes('build('))
        .length;

      if (buildMethodLines > 50) {
        complexity.score += 3;
        complexity.reasons.push('Large build method');
      }
    }

    // Check for nested widgets
    const nestedWidgets = file.chunks
        .flatMap(chunk => chunk.lines)
        .filter(line => line.content.includes('child:') || line.content.includes('children:'))
        .length;

    if (nestedWidgets > 10) {
      complexity.score += 2;
      complexity.reasons.push('Deep widget nesting');
    }

    return complexity;
  }

  analyzeBestPractices(file, bestPractices) {
    const metadata = file.metadata || {};

    // Check widget organization
    if (file.fileType === 'widget' && metadata.widgetTypes.includes('StatelessWidget')) {
      if (!file.newPath.includes('/widgets/')) {
        bestPractices.push({
          file: file.newPath,
          type: 'organization',
          message: 'Consider moving widget to /widgets directory'
        });
      }
    }

    // Check for proper state management
    if (file.fileType === 'screen' && !metadata.hasStateManagement) {
      bestPractices.push({
        file: file.newPath,
        type: 'state_management',
        message: 'Consider using state management for screen-level state'
      });
    }
  }

  generateRecommendations(analysis) {
    // Test coverage recommendations
    if (analysis.summary.testCoverage < 70) {
      analysis.recommendations.push({
        priority: 'high',
        message: 'Increase test coverage for modified files',
        details: `Current coverage: ${analysis.summary.testCoverage.toFixed(1)}%`
      });
    }

    // Complexity recommendations
    if (analysis.summary.complexityScore > 5) {
      analysis.recommendations.push({
        priority: 'medium',
        message: 'Consider refactoring complex widgets',
        details: 'High complexity score indicates potential maintenance issues'
      });
    }

    // Best practices recommendations
    if (analysis.details.bestPractices.length > 0) {
      analysis.recommendations.push({
        priority: 'low',
        message: 'Follow Flutter best practices',
        details: `${analysis.details.bestPractices.length} best practice violations found`
      });
    }
  }
}

module.exports = CodeAnalyzer;