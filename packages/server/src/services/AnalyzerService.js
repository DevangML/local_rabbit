const _path = require('path');
// eslint-disable-next-line no-unused-vars
const fs = require('fs').promises;
const logger = require('../utils/logger');
const { exec } = require('child_process');

/**
 * @typedef {Object} FileChange
 * @property {string} name - File name
 * @property {string} extension - File extension
 * @property {number} additions - Number of added lines
 * @property {number} deletions - Number of deleted lines
 * @property {string[]} changes - Array of change lines
 * @property {string} path - File path
 * @property {{impactLevel?: 'high' | 'medium' | 'low' | 'unknown'}} [analysis] - Analysis results
 */

/**
 * @typedef {Object} ComplexityResult
 * @property {number} score - Complexity score
 * @property {number} changes - Number of changes
 */

/**
 * @typedef {Object} GeminiService
 * @property {Function} analyzeDiff - Method to analyze diff using AI
 */

class AnalyzerService {
  static COMPLEXITY_THRESHOLDS = {
    LOW: 10,
    MEDIUM: 30,
    HIGH: 50
  };

  /**
   * Create a new AnalyzerService instance
   * @param {string} repoPath - Path to the repository
   * @param {GeminiService|null} geminiService - Service for AI-powered analysis
   */
  constructor(repoPath = '', geminiService = null) {
    this.repoPath = repoPath;
    this.geminiService = geminiService;
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
      if (prompt && this.geminiService) {
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
   * @returns {FileChange[]} - Array of file objects
   */
  static parseDiff(diffOutput) {
    if (!diffOutput) return [];

    /** @type {FileChange[]} */
    const files = [];
    /** @type {FileChange|null} */
    let currentFile = null;

    diffOutput.split('\n').forEach(line => {
      if (line.startsWith('diff --git')) {
        if (currentFile) files.push(currentFile);
        currentFile = {
          name: '',
          extension: '',
          additions: 0,
          deletions: 0,
          changes: [],
          path: ''
        };
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
    /** @type {{[key: string]: string}} */
    const fileTypes = {
      js: 'JavaScript',
      jsx: 'React',
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
   * @param {FileChange} file - File object
   * @returns {ComplexityResult} - Complexity metrics
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
   * Calculate impact level based on complexity
   * @param {FileChange} file - File object
   * @param {ComplexityResult} complexity - Complexity metrics
   * @returns {string} - Impact level (high, medium, low)
   */
  static calculateImpactLevel(file, complexity) {
    if (complexity.score === 3) return 'high';
    if (complexity.score === 2) return 'medium';
    return 'low';
  }

  /**
   * Analyze a file's changes
   * @param {FileChange} file - File object
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeFile(file) {
    try {
      // Determine file type based on extension
      const fileType = AnalyzerService.getFileType(file.extension);

      // Calculate complexity metrics
      const complexity = AnalyzerService.calculateComplexity(file);

      return {
        fileType,
        complexity,
        impactLevel: AnalyzerService.calculateImpactLevel(file, complexity),
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
   * @param {FileChange[]} files - Array of analyzed file objects
   * @returns {Object} - Summary object
   */
  static generateSummary(files) {
    const totalFiles = files.length;
    const totalAdditions = files.reduce((sum, file) => sum + file.additions, 0);
    const totalDeletions = files.reduce((sum, file) => sum + file.deletions, 0);

    // Count files by impact level
    /** @type {{high: number, medium: number, low: number, unknown: number}} */
    const impactCounts = {
      high: 0,
      medium: 0,
      low: 0,
      unknown: 0,
    };

    files.forEach((file) => {
      if (file.analysis && file.analysis.impactLevel) {
        const level = file.analysis.impactLevel;
        if (level === 'high' || level === 'medium' || level === 'low') {
          impactCounts[level] += 1;
        } else {
          impactCounts.unknown += 1;
        }
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
