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
      console.log(`Getting diff between ${fromBranch} and ${toBranch}`);
      
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

      // Validate branches exist
      const branches = await this.git.branch();
      const allBranches = branches.all || [];
      
      if (!allBranches.includes(fromBranch) && !allBranches.includes(`remotes/origin/${fromBranch}`)) {
        response.errors = [`Branch '${fromBranch}' does not exist in the repository`];
        return response;
      }
      
      if (!allBranches.includes(toBranch) && !allBranches.includes(`remotes/origin/${toBranch}`)) {
        response.errors = [`Branch '${toBranch}' does not exist in the repository`];
        return response;
      }

      try {
        // Get the raw diff
        const diffResult = await this.git.diff([fromBranch, toBranch]);
        console.log('Raw diff length:', diffResult.length);

        if (!diffResult) {
          console.log('No diff result found');
          response.message = 'No changes between branches';
          return response;
        }

        // Parse the diff into structured data
        const files = await this.parseDiff(diffResult, fromBranch, toBranch);
        console.log('Parsed files:', files.length);

        // Ensure each file has content
        for (const file of files) {
          if (!file.content) {
            try {
              // For added/modified files, get content from toBranch
              // For deleted files, get content from fromBranch
              const branch = file.status === 'deleted' ? fromBranch : toBranch;
              const path = file.status === 'deleted' ? file.oldPath : file.path;
              
              console.log(`Getting content for ${path} from ${branch}`);
              const content = await this.git.show([`${branch}:${path}`]);
              file.content = content || '';
            } catch (error) {
              console.warn(`Failed to get content for ${file.path}:`, error);
              file.content = '';
            }
          }
        }
        
        if (!files || !Array.isArray(files)) {
          console.error('Invalid parsed files result');
          response.message = 'Error parsing diff results';
          response.errors = ['Invalid diff parsing result'];
          return response;
        }

        response.files = files;
        response.summary = this.generateSummary(files);
        console.log('Response summary:', response.summary);

        return response;

      } catch (diffError) {
        console.error('Error getting diff:', diffError);
        response.errors = [diffError.message];
        return response;
      }

    } catch (error) {
      console.error('Error analyzing changes:', error);
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
    let currentChunk = null;
    let contentLines = [];

    for (let i = 0; i < diffLines.length; i++) {
      const line = diffLines[i];
      
      if (line.startsWith('diff --git')) {
        if (currentFile) {
          if (currentChunk) {
            currentFile.chunks.push(currentChunk);
            currentChunk = null;
          }
          // Add the content before pushing the file
          currentFile.content = contentLines.join('\n');
          files.push(currentFile);
          contentLines = []; // Reset content lines for next file
        }

        // Parse both a/ and b/ paths correctly
        const match = line.match(/^diff --git a\/(.*) b\/(.*)$/);
        if (match) {
          const [, oldPath, newPath] = match;
          
          // Determine if file is new, deleted, or modified
          let fileStatus = 'modified';
          let fileContent = '';
          
          try {
            await this.git.show([`${fromBranch}:${oldPath}`]);
          } catch (e) {
            fileStatus = 'added';
          }
          
          if (fileStatus === 'modified') {
            try {
              await this.git.show([`${toBranch}:${newPath}`]);
            } catch (e) {
              fileStatus = 'deleted';
            }
          }

          currentFile = {
            oldPath,
            path: newPath,
            type: this.getFileType(newPath),
            status: fileStatus,
            additions: 0,
            deletions: 0,
            chunks: [],
            analysis: await this.analyzeFile(oldPath, newPath, fromBranch, toBranch, fileStatus)
          };
        }
      } else if (line.startsWith('@@ ')) {
        // If we have a current chunk, save it before starting a new one
        if (currentChunk) {
          currentFile.chunks.push(currentChunk);
        }

        // Parse chunk header
        const chunkMatch = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
        if (chunkMatch) {
          const [, oldStart, oldCount, newStart, newCount] = chunkMatch;
          currentChunk = {
            oldStart: parseInt(oldStart),
            oldLines: parseInt(oldCount || 1),
            newStart: parseInt(newStart),
            newLines: parseInt(newCount || 1),
            lines: []
          };
        }
      } else if (currentFile && currentChunk) {
        // Process diff content lines
        if (line.startsWith('+')) {
          currentFile.additions++;
          currentChunk.lines.push({ 
            type: 'addition',
            content: line.substring(1)
          });
          contentLines.push(line.substring(1));
        } else if (line.startsWith('-')) {
          currentFile.deletions++;
          currentChunk.lines.push({ 
            type: 'deletion',
            content: line.substring(1)
          });
          // Don't add deletions to content as they're not in the final state
        } else if (!line.startsWith('\\')) { // Ignore "No newline at end of file" markers
          const content = line.startsWith(' ') ? line.substring(1) : line;
          currentChunk.lines.push({ 
            type: 'context',
            content
          });
          contentLines.push(content);
        }
      }
    }

    // Don't forget to add the last chunk and file
    if (currentFile) {
      if (currentChunk) {
        currentFile.chunks.push(currentChunk);
      }
      currentFile.content = contentLines.join('\n');
      files.push(currentFile);
    }

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

  async analyzeFile(oldPath, newPath, fromBranch, toBranch, fileStatus) {
    try {
      let content;
      
      // Get content based on file status
      if (fileStatus === 'added') {
        content = await this.git.show([`${toBranch}:${newPath}`]);
      } else if (fileStatus === 'deleted') {
        content = await this.git.show([`${fromBranch}:${oldPath}`]);
      } else {
        // For modified files, analyze the new version
        content = await this.git.show([`${toBranch}:${newPath}`]);
      }

      if (!content || !newPath.endsWith('.dart')) return null;

      const analysis = {
        imports: [],
        widgets: [],
        stateManagement: {
          isStateful: false,
          usesBloc: false,
          usesProvider: false
        },
        complexity: {
          widgetNesting: 0,
          stateVariables: 0
        }
      };

      const lines = content.split('\n');
      let classDepth = 0;
      let bracketCount = 0;
      let inStateClass = false;

      for (const line of lines) {
        // Analyze imports
        if (line.trim().startsWith('import')) {
          const importMatch = line.match(/['"]([^'"]+)['"]/);
          if (importMatch) {
            const importPath = importMatch[1];
            analysis.imports.push(importPath);
            
            if (importPath.includes('bloc') || importPath.includes('cubit')) {
              analysis.stateManagement.usesBloc = true;
            }
            if (importPath.includes('provider')) {
              analysis.stateManagement.usesProvider = true;
            }
          }
        }

        // Analyze widget classes
        if (line.includes('class')) {
          if (line.includes('extends StatefulWidget')) {
            analysis.widgets.push('StatefulWidget');
            analysis.stateManagement.isStateful = true;
          }
          if (line.includes('extends StatelessWidget')) {
            analysis.widgets.push('StatelessWidget');
          }
          classDepth++;
        }

        // Track state class
        if (line.includes('class _') && line.includes('State<')) {
          inStateClass = true;
        }

        // Count state variables
        if (inStateClass && (line.includes('final ') || line.includes(' var ')) && 
            !line.trimStart().startsWith('//')) {
          analysis.complexity.stateVariables++;
        }

        // Count brackets for nesting analysis
        bracketCount += (line.match(/{/g) || []).length;
        bracketCount -= (line.match(/}/g) || []).length;
        
        if (bracketCount > analysis.complexity.widgetNesting) {
          analysis.complexity.widgetNesting = bracketCount;
        }
      }

      return analysis;
    } catch (error) {
      console.error(`Error analyzing file ${newPath}:`, error);
      return { error: `Failed to analyze: ${error.message}` };
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
        if (file.analysis.stateManagement?.isStateful) {
          summary.stateManagement.stateful++;
        }
        if (file.analysis.widgets?.includes('StatelessWidget')) {
          summary.stateManagement.stateless++;
        }
        if (file.analysis.stateManagement?.usesBloc) {
          summary.stateManagement.bloc++;
        }
        if (file.analysis.stateManagement?.usesProvider) {
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