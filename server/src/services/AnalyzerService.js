const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

class AnalyzerService {
  constructor(repoPath = '') {
    this.repoPath = repoPath;
  }

  /**
   * Set the repository path
   * @param {string} repoPath - Path to the repository
   */
  setRepoPath(repoPath) {
    this.repoPath = repoPath;
  }

  /**
   * Analyze a diff output
   * @param {string} diffOutput - Git diff output
   * @returns {Promise<Object>} - Analyzed diff data
   */
  async analyzeDiff(diffOutput) {
    try {
      // Parse the diff output
      const files = this.parseDiff(diffOutput);
      
      // Analyze each file
      const analyzedFiles = await Promise.all(
        files.map(async (file) => {
          return {
            ...file,
            analysis: await this.analyzeFile(file)
          };
        })
      );
      
      return {
        files: analyzedFiles,
        summary: this.generateSummary(analyzedFiles)
      };
    } catch (error) {
      logger.error('Error analyzing diff:', error);
      throw error;
    }
  }

  /**
   * Parse diff output into structured data
   * @param {string} diffOutput - Git diff output
   * @returns {Array} - Array of file objects
   */
  parseDiff(diffOutput) {
    const files = [];
    let currentFile = null;
    
    // Split the diff output into lines
    const lines = diffOutput.split('\n');
    
    for (const line of lines) {
      // Check if line indicates a new file
      if (line.startsWith('diff --git')) {
        // If we have a current file, add it to the files array
        if (currentFile) {
          files.push(currentFile);
        }
        
        // Extract file path
        const match = line.match(/diff --git a\/(.*) b\/(.*)/);
        const filePath = match ? match[1] : 'unknown';
        
        // Create a new file object
        currentFile = {
          path: filePath,
          name: path.basename(filePath),
          extension: path.extname(filePath).slice(1),
          changes: [],
          additions: 0,
          deletions: 0
        };
      } 
      // Check if line is a hunk header
      else if (line.startsWith('@@')) {
        // Extract line numbers
        const match = line.match(/@@ -(\d+),?(\d+)? \+(\d+),?(\d+)? @@/);
        
        if (match && currentFile) {
          const startLine = parseInt(match[3], 10);
          currentFile.changes.push({
            type: 'hunk',
            content: line,
            startLine
          });
        }
      } 
      // Check if line is an addition
      else if (line.startsWith('+') && !line.startsWith('+++')) {
        if (currentFile) {
          currentFile.changes.push({
            type: 'addition',
            content: line.slice(1)
          });
          currentFile.additions++;
        }
      } 
      // Check if line is a deletion
      else if (line.startsWith('-') && !line.startsWith('---')) {
        if (currentFile) {
          currentFile.changes.push({
            type: 'deletion',
            content: line.slice(1)
          });
          currentFile.deletions++;
        }
      } 
      // Otherwise, it's a context line
      else if (currentFile && !line.startsWith('---') && !line.startsWith('+++')) {
        currentFile.changes.push({
          type: 'context',
          content: line
        });
      }
    }
    
    // Add the last file
    if (currentFile) {
      files.push(currentFile);
    }
    
    return files;
  }

  /**
   * Analyze a file's changes
   * @param {Object} file - File object
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeFile(file) {
    try {
      // Determine file type based on extension
      const fileType = this.getFileType(file.extension);
      
      // Calculate complexity metrics
      const complexity = this.calculateComplexity(file);
      
      return {
        fileType,
        complexity,
        impactLevel: this.calculateImpactLevel(file, complexity)
      };
    } catch (error) {
      logger.error(`Error analyzing file ${file.path}:`, error);
      return {
        fileType: 'unknown',
        complexity: { score: 0 },
        impactLevel: 'unknown'
      };
    }
  }

  /**
   * Get file type based on extension
   * @param {string} extension - File extension
   * @returns {string} - File type
   */
  getFileType(extension) {
    const typeMap = {
      js: 'JavaScript',
      jsx: 'React',
      ts: 'TypeScript',
      tsx: 'React TypeScript',
      py: 'Python',
      java: 'Java',
      rb: 'Ruby',
      php: 'PHP',
      go: 'Go',
      rs: 'Rust',
      c: 'C',
      cpp: 'C++',
      cs: 'C#',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      json: 'JSON',
      md: 'Markdown',
      yml: 'YAML',
      yaml: 'YAML',
      xml: 'XML',
      sql: 'SQL'
    };
    
    return typeMap[extension.toLowerCase()] || 'Unknown';
  }

  /**
   * Calculate complexity metrics for a file
   * @param {Object} file - File object
   * @returns {Object} - Complexity metrics
   */
  calculateComplexity(file) {
    // Simple complexity calculation based on number of changes
    const totalChanges = file.additions + file.deletions;
    
    let score;
    if (totalChanges < 10) {
      score = 1; // Low complexity
    } else if (totalChanges < 50) {
      score = 2; // Medium complexity
    } else {
      score = 3; // High complexity
    }
    
    return {
      score,
      changes: totalChanges,
      additions: file.additions,
      deletions: file.deletions
    };
  }

  /**
   * Calculate impact level of changes
   * @param {Object} file - File object
   * @param {Object} complexity - Complexity metrics
   * @returns {string} - Impact level
   */
  calculateImpactLevel(file, complexity) {
    // Determine impact level based on complexity and file type
    if (complexity.score === 3) {
      return 'high';
    } else if (complexity.score === 2) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate a summary of the analyzed diff
   * @param {Array} files - Array of analyzed file objects
   * @returns {Object} - Summary object
   */
  generateSummary(files) {
    const totalFiles = files.length;
    const totalAdditions = files.reduce((sum, file) => sum + file.additions, 0);
    const totalDeletions = files.reduce((sum, file) => sum + file.deletions, 0);
    
    // Count files by impact level
    const impactCounts = {
      high: 0,
      medium: 0,
      low: 0,
      unknown: 0
    };
    
    files.forEach(file => {
      if (file.analysis && file.analysis.impactLevel) {
        impactCounts[file.analysis.impactLevel]++;
      } else {
        impactCounts.unknown++;
      }
    });
    
    // Determine overall impact
    let overallImpact;
    if (impactCounts.high > 0) {
      overallImpact = 'high';
    } else if (impactCounts.medium > 0) {
      overallImpact = 'medium';
    } else {
      overallImpact = 'low';
    }
    
    return {
      totalFiles,
      totalAdditions,
      totalDeletions,
      impactCounts,
      overallImpact
    };
  }
}

module.exports = AnalyzerService; 