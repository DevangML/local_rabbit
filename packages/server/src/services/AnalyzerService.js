const _path = require('path');
// eslint-disable-next-line no-unused-vars
const fs = require('fs').promises;
const logger = require('../utils/logger');
const { _exec } = require('child_process');

class AnalyzerService {
  static COMPLEXITY_THRESHOLDS = {
    LOW: 10,
    MEDIUM: 30,
    HIGH: 50
  };

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
   * @param {string} prompt - Custom prompt for analysis
   * @returns {Promise<Object>} - Analyzed diff data
   */
  async analyzeDiff(diffOutput, prompt = '') {
    try {
      const files = AnalyzerService.parseDiff(diffOutput);

      // If a custom prompt is provided, use it for AI analysis
      if (prompt) {
        const aiAnalysis = await this.geminiService.analyzeDiff(files, prompt);
        return {
          ...aiAnalysis,
          files: files.map(file => ({
            name: file.name,
            type: AnalyzerService.getFileType(file.extension),
            changes: file.changes
          }))
        };
      }

      // Default analysis without AI
      const analysis = {
        files: files.map(file => {
          const complexity = AnalyzerService.calculateComplexity(file);
          return {
            name: file.name,
            type: AnalyzerService.getFileType(file.extension),
            complexity: complexity.score,
            impact: AnalyzerService.calculateImpactLevel(file, complexity),
            changes: complexity.changes
          };
        }),
        summary: {
          totalFiles: files.length,
          complexityScore: files.reduce((sum, file) =>
            sum + AnalyzerService.calculateComplexity(file).score, 0)
        }
      };

      return analysis;
    } catch (error) {
      logger.error('Error analyzing diff:', error);
      throw new Error('Failed to analyze diff');
    }
  }

  /**
   * Parse git diff output into structured file objects
   * @param {string} diffOutput - Git diff output
   * @returns {Array} - Array of file objects
   */
  static parseDiff(diffOutput) {
    if (!diffOutput) return [];

    const files = [];
    let currentFile = null;

    diffOutput.split('\n').forEach(line => {
      if (line.startsWith('diff --git')) {
        if (currentFile) files.push(currentFile);
        currentFile = { changes: [] };
      } else if (currentFile) {
        currentFile.changes.push(line);
      }
    });

    if (currentFile) files.push(currentFile);
    return files;
  }

  /**
   * Get file type based on extension
   * @param {string} extension - File extension
   * @returns {string} - File type
   */
  static getFileType(extension) {
    const fileTypes = {
      js: 'JavaScript',
      ts: 'TypeScript',
      jsx: 'React',
      tsx: 'React TypeScript',
      py: 'Python',
      java: 'Java',
      rb: 'Ruby',
      go: 'Go',
      rs: 'Rust',
      php: 'PHP'
    };
    return fileTypes[extension] || 'Unknown';
  }

  /**
   * Calculate complexity metrics for a file
   * @param {Object} file - File object
   * @returns {Object} - Complexity metrics
   */
  static calculateComplexity(file) {
    const totalChanges = file.additions + file.deletions;
    let score = 1;

    if (totalChanges > this.COMPLEXITY_THRESHOLDS.HIGH) {
      score = 3;
    } else if (totalChanges > this.COMPLEXITY_THRESHOLDS.MEDIUM) {
      score = 2;
    }

    return {
      score,
      changes: totalChanges
    };
  }

  /**
   * Calculate impact level of changes
   * @param {Object} file - File object
   * @param {Object} complexity - Complexity metrics
   * @returns {string} - Impact level
   */
  static calculateImpactLevel(file, complexity) {
    if (complexity.score === 3) return 'high';
    if (complexity.score === 2) return 'medium';
    return 'low';
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
