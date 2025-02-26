const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs').promises;
const yaml = require('js-yaml');

class GitService {
  constructor(repoPath) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  async getCurrentBranch() {
    try {
      const status = await this.git.status();
      return status.current;
    } catch (error) {
      console.error('Error getting current branch:', error);
      throw error;
    }
  }

  async validateFlutterRepo() {
    try {
      // First verify it's a working git repository by trying a git command
      try {
        await this.git.status();
      } catch (gitError) {
        throw new Error('Not a valid git repository. Please select a directory that contains a git repository.');
      }

      // Now check if it's a Flutter project
      const pubspecPath = path.join(this.repoPath, 'pubspec.yaml');
      try {
        const content = await fs.readFile(pubspecPath, 'utf8');
        const pubspec = yaml.load(content);
        
        if (!pubspec.dependencies?.flutter) {
          throw new Error('Not a Flutter repository: flutter dependency not found in pubspec.yaml');
        }
      } catch (flutterError) {
        if (flutterError.code === 'ENOENT') {
          throw new Error('Not a Flutter repository: pubspec.yaml not found');
        }
        throw flutterError;
      }
      
      return true;
    } catch (error) {
      console.error('Repository validation error:', error);
      throw error;
    }
  }

  async getDiff(fromBranch, toBranch) {
    try {
      // First validate that this is a Flutter repo
      await this.validateFlutterRepo();

      // Get the raw diff
      const diffResult = await this.git.diff([fromBranch, toBranch, '--', '*.dart']);
      
      // Initialize with empty response structure
      const response = { 
        files: [], 
        summary: { 
          totalFiles: 0,
          totalAdditions: 0,
          totalDeletions: 0,
          byType: {},
          stateManagement: {
            stateful: 0,
            stateless: 0,
            bloc: 0,
            provider: 0
          }
        },
        errors: null
      };

      if (!diffResult) {
        response.message = 'No Dart files changed between branches';
        return response;
      }

      // Parse the diff into structured data
      const files = await this.parseDiff(diffResult, fromBranch, toBranch);
      
      if (!files || !Array.isArray(files)) {
        response.message = 'Error parsing diff results';
        response.errors = ['Invalid diff parsing result'];
        return response;
      }

      response.files = files;
      response.summary = this.generateSummary(files);

      return response;

    } catch (error) {
      console.error('Error analyzing Flutter changes:', error);
      return {
        files: [],
        summary: {
          totalFiles: 0,
          totalAdditions: 0,
          totalDeletions: 0,
          byType: {},
          stateManagement: {
            stateful: 0,
            stateless: 0,
            bloc: 0,
            provider: 0
          }
        },
        errors: [error.message || 'Unknown error occurred while analyzing changes']
      };
    }
  }

  async parseDiff(diffText, fromBranch, toBranch) {
    const files = [];
    const diffLines = diffText.split('\n');
    let currentFile = null;

    for (let i = 0; i < diffLines.length; i++) {
      const line = diffLines[i];
      
      if (line.startsWith('diff --git')) {
        if (currentFile) {
          files.push(currentFile);
        }

        // Extract file path more robustly
        const filePathMatch = line.match(/b\/(.+)$/);
        const filePath = filePathMatch ? filePathMatch[1] : '';
        
        // Only create a file entry if we have a valid path
        if (filePath) {
          currentFile = {
            path: filePath,
            type: this.getFileType(filePath),
            additions: 0,
            deletions: 0,
            changes: [],
            analysis: await this.analyzeFile(filePath, fromBranch, toBranch)
          };
        }
      } else if (currentFile) {  // Only process changes if we have a valid currentFile
        if (line.startsWith('+') && !line.startsWith('+++')) {
          currentFile.additions++;
          currentFile.changes.push({ type: 'addition', content: line.substring(1) });
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          currentFile.deletions++;
          currentFile.changes.push({ type: 'deletion', content: line.substring(1) });
        }
      }
    }

    if (currentFile) {
      files.push(currentFile);
    }

    // Filter out any files without valid paths
    return files.filter(file => file && file.path);
  }

  getFileType(filePath) {
    const patterns = {
      widget: ['/widgets/', '/components/'],
      screen: ['/screens/', '/pages/', '/views/'],
      model: ['/models/', '/entities/'],
      bloc: ['/bloc/', '/cubit/'],
      service: ['/services/', '/repositories/', '/providers/'],
      test: ['_test.dart'],
      generated: ['.g.dart', '.freezed.dart']
    };

    for (const [type, paths] of Object.entries(patterns)) {
      if (paths.some(p => filePath.includes(p))) {
        return type;
      }
    }

    return 'other';
  }

  async analyzeFile(filePath, fromBranch, toBranch) {
    try {
      const content = await this.git.show([`${toBranch}:${filePath}`]);
      if (!content) return null;

      const analysis = {
        imports: [],
        widgets: [],
        stateManagement: {
          type: null,
          isStateful: false,
          usesBloc: false,
          usesProvider: false
        },
        dependencies: new Set(),
        complexity: {
          widgetNesting: 0,
          stateVariables: 0
        }
      };

      const lines = content.split('\n');
      let inClassDefinition = false;
      let bracketCount = 0;

      for (const line of lines) {
        // Analyze imports
        if (line.trim().startsWith('import')) {
          const importPath = line.match(/'([^']+)'/)?.[1];
          if (importPath) {
            analysis.imports.push(importPath);
            if (importPath.includes('package:flutter_bloc')) {
              analysis.stateManagement.usesBloc = true;
            }
            if (importPath.includes('package:provider')) {
              analysis.stateManagement.usesProvider = true;
            }
          }
        }

        // Analyze class definitions
        if (line.includes('class')) {
          if (line.includes('extends StatefulWidget')) {
            analysis.stateManagement.isStateful = true;
            analysis.widgets.push('StatefulWidget');
          }
          if (line.includes('extends StatelessWidget')) {
            analysis.widgets.push('StatelessWidget');
          }
          inClassDefinition = true;
        }

        // Count brackets for nesting analysis
        bracketCount += (line.match(/{/g) || []).length;
        bracketCount -= (line.match(/}/g) || []).length;
        
        if (bracketCount > analysis.complexity.widgetNesting) {
          analysis.complexity.widgetNesting = bracketCount;
        }

        // Look for state variables
        if (inClassDefinition && line.includes('final') || line.includes('var')) {
          analysis.complexity.stateVariables++;
        }
      }

      return analysis;

    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      return null;
    }
  }

  generateSummary(files) {
    const summary = {
      totalFiles: files.length,
      totalAdditions: 0,
      totalDeletions: 0,
      byType: {},
      stateManagement: {
        stateful: 0,
        stateless: 0,
        bloc: 0,
        provider: 0
      }
    };

    for (const file of files) {
      summary.totalAdditions += file.additions;
      summary.totalDeletions += file.deletions;
      
      summary.byType[file.type] = (summary.byType[file.type] || 0) + 1;

      if (file.analysis) {
        if (file.analysis.stateManagement.isStateful) {
          summary.stateManagement.stateful++;
        }
        if (file.analysis.widgets.includes('StatelessWidget')) {
          summary.stateManagement.stateless++;
        }
        if (file.analysis.stateManagement.usesBloc) {
          summary.stateManagement.bloc++;
        }
        if (file.analysis.stateManagement.usesProvider) {
          summary.stateManagement.provider++;
        }
      }
    }

    return summary;
  }

  async getBranches() {
    try {
      // First verify it's a working git repository
      try {
        await this.git.status();
      } catch (gitError) {
        console.error('Git status check failed:', gitError);
        throw new Error('Not a valid git repository. Please select a directory that contains a git repository.');
      }

      console.log('Getting branches for repo at:', this.repoPath);
      const result = await this.git.branch();
      console.log('Branch result:', result);
      
      if (!result || !result.all || !Array.isArray(result.all)) {
        console.error('Invalid branch result:', result);
        throw new Error('Failed to get branch information from repository');
      }

      return {
        current: result.current,
        all: result.all,
        branches: result.branches
      };
    } catch (error) {
      console.error('Error getting branches:', error);
      throw error;
    }
  }
}

module.exports = GitService;