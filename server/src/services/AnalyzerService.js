const path = require('path');
// eslint-disable-next-line no-unused-vars
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
      const files = AnalyzerService.parseDiff(diffOutput);

      // Analyze each file
      const analyzedFiles = await Promise.all(
        files.map(async (file) => ({
          ...file,
          analysis: await this.analyzeFile(file),
        })),
      );

      return {
        files: analyzedFiles,
        summary: this.generateSummary(analyzedFiles),
      };
    } catch (error) {
      logger.error('Error analyzing diff:', error);
      throw error;
    }
  }

  /**
   * Parse git diff output into structured file objects
   * @param {string} diffOutput - Git diff output
   * @returns {Array} - Array of file objects
   */
  static parseDiff(diffOutput) {
    const files = [];
    let currentFile = null;

    // Split the diff output into lines
    const lines = diffOutput.split('\n');

    // Process each line
    lines.forEach((line) => {
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
          deletions: 0,
        };
      } else if (line.startsWith('@@')) { // Check if line is a hunk header
        // Extract line numbers using a safer regex pattern
        // Limit the number of digits to avoid catastrophic backtracking
        // eslint-disable-next-line security/detect-unsafe-regex
        const match = line.match(/@@ -(\d{1,7})(?:,(\d{1,7}))? \+(\d{1,7})(?:,(\d{1,7}))? @@/);

        if (match && currentFile) {
          const startLine = parseInt(match[3], 10);
          currentFile.changes.push({
            type: 'hunk',
            content: line,
            startLine,
          });
        }
      } else if (line.startsWith('+') && !line.startsWith('+++')) { // Check if line is an addition
        if (currentFile) {
          currentFile.changes.push({
            type: 'addition',
            content: line.slice(1),
          });
          currentFile.additions += 1;
        }
      } else if (line.startsWith('-') && !line.startsWith('---')) { // Check if line is a deletion
        if (currentFile) {
          currentFile.changes.push({
            type: 'deletion',
            content: line.slice(1),
          });
          currentFile.deletions += 1;
        }
      } else if (currentFile && !line.startsWith('---') && !line.startsWith('+++')) { // Otherwise, it's a context line
        currentFile.changes.push({
          type: 'context',
          content: line,
        });
      }
    });

    // Add the last file if it exists
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
        impactLevel: this.calculateImpactLevel(file, complexity),
      };
    } catch (error) {
      logger.error(`Error analyzing file ${file.path}:`, error);
      return {
        fileType: 'unknown',
        complexity: { score: 0 },
        impactLevel: 'unknown',
      };
    }
  }

  /**
   * Get file type based on extension
   * @param {string} extension - File extension
   * @returns {string} - File type
   */
  static getFileType(extension) {
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
      sql: 'SQL',
    };

    return typeMap[extension.toLowerCase()] || 'Unknown';
  }

  /**
   * Calculate complexity metrics for a file
   * @param {Object} file - File object
   * @returns {Object} - Complexity metrics
   */
  static calculateComplexity(file) {
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
      deletions: file.deletions,
    };
  }

  /**
   * Calculate impact level of changes
   * @param {Object} file - File object
   * @param {Object} complexity - Complexity metrics
   * @returns {string} - Impact level
   */
  static calculateImpactLevel(file, complexity) {
    // Determine impact level based on complexity and file type
    if (complexity.score === 3) {
      return 'high';
    } if (complexity.score === 2) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Generate a summary of the analyzed diff
   * @param {Array} files - Array of analyzed file objects
   * @returns {Object} - Summary object
   */
  static generateSummary(files) {
    const totalFiles = files.length;
    const totalAdditions = files.reduce((sum, file) => sum + file.additions, 0);
    const totalDeletions = files.reduce((sum, file) => sum + file.deletions, 0);

    // Count files by impact level
    const impactCounts = {
      high: 0,
      medium: 0,
      low: 0,
      unknown: 0,
    };

    files.forEach((file) => {
      if (file.analysis && file.analysis.impactLevel) {
        impactCounts[file.analysis.impactLevel] += 1;
      } else {
        impactCounts.unknown += 1;
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
      overallImpact,
    };
  }
}

module.exports = AnalyzerService;
