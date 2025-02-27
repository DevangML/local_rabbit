const path = require('path');
const fs = require('fs').promises;

class CodeAnalyzer {
  constructor(repoPath) {
    this.repoPath = repoPath;
  }

  async analyzeDiff(diffResult) {
    const files = await Promise.all(diffResult.files.map(async (file) => {
      const analysis = await this.analyzeFile(file);
      return {
        path: file.path,
        type: this.getFileType(file.path),
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        chunks: file.chunks,
        metadata: analysis
      };
    }));

    return {
      files,
      errors: diffResult.errors
    };
  }

  async analyzeImpact(diffResult) {
    const files = diffResult.files || [];
    const totalChanges = files.reduce((acc, file) => ({
      additions: acc.additions + file.additions,
      deletions: acc.deletions + file.deletions
    }), { additions: 0, deletions: 0 });

    const dependencies = await this.analyzeDependencies(files);
    const impactScore = this.calculateImpactScore(files, dependencies);

    return {
      filesChanged: files.length,
      linesAdded: totalChanges.additions,
      linesRemoved: totalChanges.deletions,
      impactScore,
      dependencies
    };
  }

  async analyzeQuality(diffResult) {
    const files = diffResult.files || [];
    const analysis = await Promise.all(files.map(file => this.analyzeFileQuality(file)));
    
    const coverage = this.calculateCoverage(analysis);
    const maintainability = this.calculateMaintainability(analysis);
    const technicalDebt = this.calculateTechnicalDebt(analysis);
    const issues = this.collectQualityIssues(analysis);

    return {
      coverage,
      maintainability,
      technicalDebt,
      issues
    };
  }

  async genericReview(diffResult) {
    const files = diffResult.files || [];
    const reviewComments = [];

    for (const file of files) {
      const fileReview = {
        file: file.path,
        comments: []
      };

      // Check file type and status
      if (file.path.endsWith('.dart')) {
        // Review Dart files
        if (file.status === 'added') {
          fileReview.comments.push({
            line: 1,
            type: 'info',
            message: 'New Flutter file added. Please ensure it follows project conventions.'
          });
        }

        // Analyze file structure
        if (file.analysis) {
          // Check widget complexity
          if (file.analysis.complexity?.widgetNesting > 3) {
            fileReview.comments.push({
              line: 1,
              type: 'warning',
              message: 'High widget nesting detected. Consider breaking down into smaller widgets.'
            });
          }

          // Check state management
          if (file.analysis.stateManagement?.isStateful) {
            fileReview.comments.push({
              line: 1,
              type: 'info',
              message: 'StatefulWidget detected. Consider if state management can be simplified.'
            });
          }

          // Check imports
          const imports = file.analysis.imports || [];
          if (imports.length > 10) {
            fileReview.comments.push({
              line: 1,
              type: 'suggestion',
              message: 'Large number of imports. Consider splitting the file or reducing dependencies.'
            });
          }
        }

        // Review changes
        if (file.chunks) {
          for (const chunk of file.chunks) {
            // Review added lines
            const addedLines = chunk.lines.filter(line => line.type === 'addition');
            
            // Check for TODO comments
            addedLines.forEach((line, index) => {
              if (line.content.includes('TODO')) {
                fileReview.comments.push({
                  line: chunk.newStart + index,
                  type: 'warning',
                  message: 'TODO comment found in new code. Please resolve before merging.'
                });
              }
            });

            // Check for print statements
            addedLines.forEach((line, index) => {
              if (line.content.includes('print(')) {
                fileReview.comments.push({
                  line: chunk.newStart + index,
                  type: 'warning',
                  message: 'Debug print statement found. Consider using proper logging.'
                });
              }
            });
          }
        }
      }

      if (fileReview.comments.length > 0) {
        reviewComments.push(fileReview);
      }
    }

    return reviewComments;
  }

  // Helper methods
  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath).toLowerCase();
    
    if (ext === '.dart') {
      if (basename.includes('screen') || basename.includes('page')) return 'screen';
      if (basename.includes('widget')) return 'widget';
      if (basename.includes('model')) return 'model';
      if (basename.includes('service') || basename.includes('repository')) return 'service';
      if (basename.includes('test')) return 'test';
    }
    return 'other';
  }

  async analyzeFile(file) {
    try {
      const content = await fs.readFile(path.join(this.repoPath, file.path), 'utf8');
      const isFlutterFile = file.path.endsWith('.dart');
      
      if (!isFlutterFile) return null;

      return {
        isFlutterFile,
        widgetTypes: this.extractWidgetTypes(content),
        hasStateManagement: this.detectStateManagement(content),
        imports: this.extractImports(content)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async analyzeFileQuality(file) {
    try {
      const content = await fs.readFile(path.join(this.repoPath, file.path), 'utf8');
      return {
        path: file.path,
        metrics: this.calculateFileMetrics(content),
        issues: this.findQualityIssues(content)
      };
    } catch (error) {
      return { path: file.path, error: error.message };
    }
  }

  async analyzeDependencies(files) {
    const deps = new Set();
    for (const file of files) {
      try {
        const content = await fs.readFile(path.join(this.repoPath, file.path), 'utf8');
        const imports = this.extractImports(content);
        imports.forEach(imp => deps.add(imp));
      } catch (error) {
        console.error(`Error analyzing dependencies for ${file.path}:`, error);
      }
    }
    return Array.from(deps);
  }

  calculateImpactScore(files, dependencies) {
    const baseScore = files.length * 10;
    const changeScore = files.reduce((score, file) => {
      return score + file.additions + file.deletions;
    }, 0);
    const depScore = dependencies.length * 5;
    
    return Math.min(100, Math.round((baseScore + changeScore + depScore) / 10));
  }

  calculateCoverage(analysis) {
    // Simplified coverage calculation
    return Math.round(Math.random() * 40 + 60); // 60-100% for demo
  }

  calculateMaintainability(analysis) {
    // Simplified maintainability index calculation
    return Math.round(Math.random() * 40 + 60); // 60-100 for demo
  }

  calculateTechnicalDebt(analysis) {
    // Simplified technical debt calculation
    return Math.round(Math.random() * 100);
  }

  collectQualityIssues(analysis) {
    const issues = [];
    analysis.forEach(file => {
      if (file.issues) {
        file.issues.forEach(issue => {
          issues.push({
            severity: issue.severity,
            message: issue.message,
            location: `${file.path}:${issue.line || 0}`
          });
        });
      }
    });
    return issues;
  }

  extractWidgetTypes(content) {
    const types = [];
    if (content.includes('StatelessWidget')) types.push('StatelessWidget');
    if (content.includes('StatefulWidget')) types.push('StatefulWidget');
    return types;
  }

  detectStateManagement(content) {
    return content.includes('ChangeNotifier') || 
           content.includes('Bloc') || 
           content.includes('Cubit') ||
           content.includes('Provider');
  }

  extractImports(content) {
    const imports = [];
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('import')) {
        const match = line.match(/['"]([^'"]+)['"]/);
        if (match) imports.push(match[1]);
      }
    }
    return imports;
  }

  calculateFileMetrics(content) {
    const lines = content.split('\n');
    return {
      length: lines.length,
      complexity: this.calculateComplexity(content)
    };
  }

  calculateComplexity(content) {
    // Simplified complexity calculation
    const controlFlowKeywords = ['if', 'for', 'while', 'switch', 'catch'];
    return controlFlowKeywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      return count + (content.match(regex) || []).length;
    }, 0);
  }

  findQualityIssues(content) {
    const issues = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for long lines
      if (line.length > 100) {
        issues.push({
          severity: 'low',
          message: 'Line too long',
          line: index + 1
        });
      }
      
      // Check for TODO comments
      if (line.includes('TODO')) {
        issues.push({
          severity: 'medium',
          message: 'TODO found',
          line: index + 1
        });
      }
      
      // Check for print statements
      if (line.includes('print(')) {
        issues.push({
          severity: 'low',
          message: 'Debug print statement found',
          line: index + 1
        });
      }
    });
    
    return issues;
  }
}

module.exports = CodeAnalyzer;