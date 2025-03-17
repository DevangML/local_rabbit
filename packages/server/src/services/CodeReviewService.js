const path = require('path');
const _fs = require('fs');
const { execSync } = require('child_process');
const axios = require('axios');
const logger = require('../utils/logger');

/**
 * @typedef {Object} FileDiffHunk
 * @property {number} index - The index of the hunk
 * @property {string} content - The content of the hunk
 */

/**
 * @typedef {{[key: string]: string}} FileTypeMap
 */

/**
 * @typedef {Object} ReviewIssue
 * @property {string} message - The issue message
 * @property {'high'|'medium'|'low'} severity - The severity of the issue
 * @property {number} [line] - Optional line number
 * @property {number} [column] - Optional column number
 * @property {string} [code] - Optional code snippet
 * @property {string} [file] - Optional file path
 */

/**
 * @typedef {Object} FileReviewData
 * @property {string} path - The file path
 * @property {string} type - The file type
 * @property {FileDiffHunk[]} [hunks] - The diff hunks
 * @property {string} [content] - The file content
 * @property {ReviewIssue[]} [issues] - The issues found
 * @property {string[]} [suggestions] - The suggestions
 * @property {string} [review] - The review content
 */

/**
 * @typedef {Object} IssuesBySeverity
 * @property {number} high - Number of high severity issues
 * @property {number} medium - Number of medium severity issues
 * @property {number} low - Number of low severity issues
 */

/**
 * @typedef {{[fileType: string]: FileReviewData[]}} FilesByType
 */

/**
 * @typedef {{[filePath: string]: FileReviewData}} ReviewsByPath
 */

/**
 * @typedef {Object} ReviewSummary
 * @property {Object} issueCount - Issue count by severity
 * @property {number} issueCount.high - Number of high severity issues
 * @property {number} issueCount.medium - Number of medium severity issues
 * @property {number} issueCount.low - Number of low severity issues
 * @property {number} issueCount.total - Total number of issues
 * @property {{[key: string]: number}} fileTypes - File types count
 * @property {ReviewIssue[]} topIssues - Top issues
 */

/**
 * @typedef {Object} GitServiceType
 * @property {function(string, string, string): Promise<string>} getDiffBetweenBranches - Method to get diff between branches
 */

/**
 * @typedef {Object} GeminiResponseType
 * @property {Array<{content: {parts: Array<{text: string}>}}>} candidates - The response candidates
 */

/**
 * @typedef {Object} ReviewResponse
 * @property {Object} summary - The review summary
 * @property {FileReviewData[]} files - The reviewed files
 */

/**
 * CodeReviewService class
 * Responsible for analyzing code differences and providing AI-powered code reviews
 */
class CodeReviewService {
  /**
   * Initialize the CodeReviewService
   */
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;

    // Debug: Log API key information (safely)
    if (!this.apiKey) {
      logger.error('GEMINI_API_KEY is completely missing from environment variables');
    } else {
      const keyLength = this.apiKey.length;
      const firstChars = this.apiKey.substring(0, 4);
      const lastChars = this.apiKey.substring(keyLength - 4);
      logger.info(`GEMINI_API_KEY exists with length ${keyLength}. Key starts with ${firstChars}... and ends with ...${lastChars}`);

      // Check if it matches the pattern of a valid Gemini API key (normally starts with "AIza")
      if (!this.apiKey.startsWith('AIza')) {
        logger.warn('GEMINI_API_KEY does not start with the expected prefix "AIza" which is typical for Google API keys');
      }
    }

    if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
      logger.warn('Gemini API key is missing or using the default placeholder. AI code review functionality will not work properly.');
      logger.info('To get a valid API key, visit https://ai.google.dev/ and create an API key in the Google AI Studio.');
      logger.info('Then add it to your .env file as GEMINI_API_KEY=your-key-here');
    }
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.maxRetries = 3;
    this.maxTokensPerRequest = 4096; // Control token usage

    // Import GitService dynamically to avoid circular dependencies
    this.GitService = require('./GitService.js');
  }

  /**
   * Review pull request by analyzing the diff between branches
   * @param {string} repoPath - Path to the repository
   * @param {string} baseBranch - Base branch name
   * @param {string} headBranch - Head branch name
   * @returns {Promise<ReviewResponse>} Review results
   */
  async reviewPullRequest(repoPath, baseBranch, headBranch) {
    try {
      /** @type {FileReviewData[]} */
      const files = await this.getDiffBetweenBranches(repoPath, baseBranch, headBranch);

      // Analyze files in chunks to optimize token usage
      /** @type {FileReviewData[]} */
      const reviewResults = await this.analyzeFilesWithTokenOptimization(files);

      return {
        summary: this.generateSummary(reviewResults),
        files: reviewResults,
      };
    } catch (/** @type {unknown} */ error) {
      logger.error('Error reviewing pull request:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to review pull request: ${error.message}`);
      }
      throw new Error('Failed to review pull request: Unknown error');
    }
  }

  /**
   * Get diff between two branches
   * @param {string} repoPath - Path to the repository
   * @param {string} baseBranch - Base branch name
   * @param {string} headBranch - Head branch name
   * @returns {Promise<FileReviewData[]>} Parsed diff files
   */
  async getDiffBetweenBranches(repoPath, baseBranch, headBranch) {
    try {
      // @ts-ignore - Create GitService instance
      const gitService = new this.GitService(repoPath);
      // @ts-ignore - Call instance method
      const diffOutput = await gitService.getDiffBetweenBranches(repoPath, baseBranch, headBranch);
      return this.parseGitDiff(diffOutput);
    } catch (/** @type {unknown} */ error) {
      logger.error('Error getting diff between branches:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to get diff between branches: ${error.message}`);
      }
      throw new Error('Failed to get diff between branches: Unknown error');
    }
  }

  /**
   * Parse the git diff output and transform it into a structured format
   * @param {string} diffOutput - Raw git diff output
   * @returns {Promise<FileReviewData[]>} Parsed file data
   */
  async parseGitDiff(diffOutput) {
    /** @type {FileReviewData[]} */
    const files = [];
    const diffFiles = diffOutput.split('diff --git ').filter(Boolean);

    for (const fileDiff of diffFiles) {
      try {
        const filePathMatch = fileDiff.match(/a\/(.*) b\/(.*)/);
        if (!filePathMatch) continue;

        const filePath = filePathMatch[2];
        const extension = path.extname(filePath).substring(1);

        // Extract changed lines
        const hunkMatches = [...fileDiff.matchAll(/@@\s-\d+,\d+\s\+\d+,\d+\s@@/g)];
        /** @type {FileDiffHunk[]} */
        const hunks = [];

        if (hunkMatches.length > 0) {
          for (let i = 0; i < hunkMatches.length; i++) {
            const currentMatch = hunkMatches[i];
            const currentMatchIndex = currentMatch && currentMatch.index !== undefined ? currentMatch.index : 0;

            const nextMatch = i < hunkMatches.length - 1 ? hunkMatches[i + 1] : null;
            const nextMatchIndex = nextMatch && nextMatch.index !== undefined
              ? nextMatch.index
              : fileDiff.length;

            const hunkContent = fileDiff.substring(currentMatchIndex, nextMatchIndex);
            hunks.push({
              index: i,
              content: hunkContent
            });
          }
        }

        files.push({
          path: filePath,
          type: this.getFileType(extension),
          hunks,
          content: fileDiff,
        });
      } catch (/** @type {unknown} */ error) {
        if (error instanceof Error) {
          logger.warn(`Error parsing diff for a file: ${error.message}`);
        } else {
          logger.warn('Error parsing diff for a file: Unknown error');
        }
      }
    }

    return files;
  }

  /**
   * Get the file type based on the extension
   * @param {string} extension - File extension
   * @returns {string} File type
   */
  getFileType(extension) {
    /** @type {FileTypeMap} */
    const fileTypes = {
      js: 'JavaScript',
      jsx: 'React JSX',
      py: 'Python',
      java: 'Java',
      rb: 'Ruby',
      go: 'Go',
      rs: 'Rust',
      php: 'PHP',
      cs: 'C#',
      cpp: 'C++',
      c: 'C',
      swift: 'Swift',
      kt: 'Kotlin',
      md: 'Markdown',
      json: 'JSON',
      yaml: 'YAML',
      yml: 'YAML',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      xml: 'XML',
    };

    // Check if the extension exists in the fileTypes object, if not return 'Unknown'
    return fileTypes[extension] || 'Unknown';
  }

  /**
   * Analyze files with token optimization
   * @param {FileReviewData[]} files - Files to analyze
   * @returns {Promise<FileReviewData[]>} Analyzed files with reviews
   */
  async analyzeFilesWithTokenOptimization(files) {
    const filesByType = this.groupFilesByType(files);
    /** @type {FileReviewData[]} */
    const results = [];

    try {
      for (const [fileType, typeFiles] of Object.entries(filesByType)) {
        // Split files into chunks to optimize token usage
        const fileChunks = this.chunkFilesByTokenSize(typeFiles);

        for (const chunk of fileChunks) {
          const reviewedFiles = await this.getAIReviewForChunk(chunk, fileType);
          results.push(...reviewedFiles);
        }
      }

      // Map results back to original files to ensure all files have reviews
      return this.matchReviewsToOriginalFiles(results, files);
    } catch (/** @type {unknown} */ error) {
      // If the AI review fails, return basic information for all files
      logger.error('Error analyzing files with AI:', error);

      // Create basic results for all files
      files.forEach((file) => {
        if (file && typeof file === 'object') {
          results.push({
            path: file.path,
            type: file.type,
            issues: [{ message: 'Analysis failed', severity: 'low' }],
            suggestions: ['File could not be analyzed due to an error.'],
          });
        }
      });

      return results;
    }
  }

  /**
   * Group files by their type
   * @param {FileReviewData[]} files - Files to group
   * @returns {FilesByType} Files grouped by type
   */
  groupFilesByType(files) {
    /** @type {FilesByType} */
    const filesByType = {};

    for (const file of files) {
      if (file && typeof file === 'object' && file.type) {
        if (!filesByType[file.type]) {
          filesByType[file.type] = [];
        }
        filesByType[file.type].push(file);
      }
    }

    return filesByType;
  }

  /**
   * Chunk files by token size to optimize API calls
   * @param {FileReviewData[]} files - Files to chunk
   * @returns {Array<FileReviewData[]>} Chunked files
   */
  chunkFilesByTokenSize(files) {
    /** @type {Array<FileReviewData[]>} */
    const chunks = [];
    /** @type {FileReviewData[]} */
    let currentChunk = [];
    let currentTokens = 0;

    for (const file of files) {
      if (file && typeof file === 'object' && file.content) {
        // Rough token estimation based on content length
        const estimatedTokens = Math.ceil(file.content.length / 4);

        if (currentTokens + estimatedTokens > this.maxTokensPerRequest && currentChunk.length > 0) {
          chunks.push([...currentChunk]);
          currentChunk = [];
          currentTokens = 0;
        }

        currentChunk.push(file);
        currentTokens += estimatedTokens;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Get AI review for a chunk of files
   * @param {FileReviewData[]} files - Files to review
   * @param {string} fileType - Type of the files
   * @returns {Promise<FileReviewData[]>} Reviewed files
   */
  async getAIReviewForChunk(files, fileType) {
    try {
      const prompt = this.createTypeSpecificPrompt(files, fileType);
      const response = await this.callGeminiAPI(prompt);
      return this.parseReviewResponse(response, files);
    } catch (/** @type {unknown} */ error) {
      logger.error(`Error getting AI review for ${fileType} files:`, error);

      // Return files with error information
      return files.map(file => ({
        path: file.path,
        type: file.type,
        issues: [{ message: 'Review failed', severity: 'low' }],
        suggestions: ['File could not be reviewed due to an error.'],
      }));
    }
  }

  /**
   * Create type-specific prompt for AI review
   * @param {FileReviewData[]} files - Files to review
   * @param {string} fileType - Type of the files
   * @returns {string} Generated prompt
   */
  createTypeSpecificPrompt(files, fileType) {
    // Create compact diff representation with only essential information
    /** @type {Array<{path: string, hunks: string[]}>} */
    const filesDiffSummary = files.map((file) => {
      if (file && typeof file === 'object' && file.path) {
        return {
          path: file.path,
          hunks: Array.isArray(file.hunks) && file.hunks.length > 0
            ? file.hunks.map(hunk => typeof hunk === 'string' ? hunk : hunk.content)
            : ['File changed'],
        };
      }
      return { path: 'unknown', hunks: ['File changed'] };
    });

    return `
      You are a senior software engineer conducting a code review.
      Please review the following code changes in ${fileType} files:

      ${JSON.stringify(filesDiffSummary, null, 2)}

      For each file:
      1. Identify potential bugs, performance issues, security vulnerabilities, and code style problems.
      2. Suggest improvements for code quality, readability, and maintainability.
      3. Assign a severity (high, medium, low) to each issue you find.

      Your response should be in JSON format:
      {
        "files": [
          {
            "path": "file_path",
            "issues": [
              {
                "message": "Issue description",
                "severity": "high|medium|low",
                "line": optional_line_number,
                "column": optional_column_number,
                "code": "optional_problematic_code_snippet"
              }
            ],
            "suggestions": [
              "Suggestion 1",
              "Suggestion 2"
            ]
          }
        ]
      }

      Focus on quality over quantity, and make practical, specific suggestions.
    `;
  }

  /**
   * Call Gemini API with the prompt
   * @param {string} prompt - Generated prompt
   * @returns {Promise<ReviewResponse>} API response
   */
  async callGeminiAPI(prompt) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const logger = require('../utils/logger');

    try {
      logger.info(`[API CALL] Sending request to Gemini API`);

      // Get API key from environment variable
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }

      // Initialize Gemini API client
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Generate response
      const result = await model.generateContent(prompt);
      logger.info(`[API CALL] Successful response from Gemini API`);

      // @ts-ignore - Raw response from API, will be processed later
      return result.response;
    } catch (/** @type {unknown} */ error) {
      // Debug: Log detailed error information
      logger.error('[API CALL ERROR] Error calling Gemini API:');
      if (error instanceof Error) {
        if ('response' in error) {
          // @ts-ignore
          logger.error(`Status: ${error.response?.status}`);
          // @ts-ignore
          logger.error(`Data: ${JSON.stringify(error.response?.data)}`);
        } else if ('request' in error) {
          logger.error('No response received');
        } else {
          logger.error(`Error message: ${error.message}`);
        }
      } else {
        logger.error('Unknown error:', error);
      }
      throw error;
    }
  }

  /**
   * Parse review response from API
   * @param {ReviewResponse} response - API response
   * @param {FileReviewData[]} originalFiles - Original files
   * @returns {FileReviewData[]} Parsed reviews
   */
  parseReviewResponse(response, originalFiles) {
    try {
      // @ts-ignore - Handle the Gemini API response format
      if (response && typeof response === 'object' &&
        // @ts-ignore - Candidates property from Gemini API
        Array.isArray(response.candidates) &&
        // @ts-ignore - Candidates property from Gemini API
        response.candidates.length > 0) {

        // @ts-ignore - Extract text content from Gemini response
        const textContent = response.candidates[0].content.parts[0].text;

        // Find JSON in the response
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        /** @type {{ files: FileReviewData[] }} */
        const reviewData = JSON.parse(jsonMatch[0]);
        if (!reviewData || !Array.isArray(reviewData.files)) {
          throw new Error('Invalid JSON structure in response');
        }

        return reviewData.files;
      }

      throw new Error('Invalid response format');
    } catch (/** @type {unknown} */ error) {
      logger.error('Error parsing review response:', error);

      // Return basic information for the files
      return originalFiles.map((file) => ({
        path: file.path,
        type: file.type,
        issues: [],
        suggestions: ['Failed to parse AI analysis.'],
      }));
    }
  }

  /**
   * Match reviews to original files
   * @param {FileReviewData[]} fileReviews - File reviews
   * @param {FileReviewData[]} originalFiles - Original files
   * @returns {FileReviewData[]} Matched reviews
   */
  matchReviewsToOriginalFiles(fileReviews, originalFiles) {
    /** @type {ReviewsByPath} */
    const reviewsByPath = {};

    // Create lookup by path
    fileReviews.forEach((review) => {
      if (review && typeof review === 'object' && review.path) {
        reviewsByPath[review.path] = review;
      }
    });

    // Ensure all original files have reviews
    return originalFiles.map((file) => {
      if (file && typeof file === 'object' && file.path) {
        const review = reviewsByPath[file.path];

        if (review) {
          return {
            path: file.path,
            type: file.type,
            issues: review.issues || [],
            suggestions: review.suggestions || [],
            review: review.review,
          };
        }

        // Default for files without reviews
        return {
          path: file.path,
          type: file.type,
          issues: [],
          suggestions: ['No specific issues found.'],
        };
      }

      // Fallback for invalid files
      return {
        path: 'unknown',
        type: 'unknown',
        issues: [],
        suggestions: ['Invalid file object'],
      };
    });
  }

  /**
   * Generate summary from file reviews
   * @param {FileReviewData[]} fileReviews - File reviews
   * @returns {ReviewSummary} Generated summary
   */
  generateSummary(fileReviews) {
    /** @type {IssuesBySeverity} */
    const issuesBySeverity = {
      high: 0,
      medium: 0,
      low: 0,
    };

    /** @type {{[key: string]: number}} */
    const fileTypeCount = {};

    // Count issues by severity
    fileReviews.forEach((file) => {
      if (file && typeof file === 'object') {
        // Count file types
        if (file.type) {
          fileTypeCount[file.type] = (fileTypeCount[file.type] || 0) + 1;
        }

        // Count issues by severity
        if (file.issues && Array.isArray(file.issues)) {
          file.issues.forEach((issue) => {
            if (issue && typeof issue === 'object' && issue.severity) {
              const severity = issue.severity;
              if (severity === 'high' || severity === 'medium' || severity === 'low') {
                issuesBySeverity[severity]++;
              }
            }
          });
        }
      }
    });

    // Calculate total issues
    const totalIssues = issuesBySeverity.high + issuesBySeverity.medium + issuesBySeverity.low;

    // Extract top issues
    /** @type {ReviewIssue[]} */
    const allIssues = fileReviews.flatMap((file) => {
      if (file && typeof file === 'object' && file.path && file.issues && Array.isArray(file.issues)) {
        return file.issues.map((issue) => ({
          ...issue,
          file: file.path,
        }));
      }
      return [];
    });

    // Sort issues by severity (high -> medium -> low)
    const highPriorityIssues = allIssues.filter(issue => issue.severity === 'high');
    const mediumPriorityIssues = allIssues.filter(issue => issue.severity === 'medium');

    // Combine issues, prioritizing high and medium severity
    const topIssues = [
      ...highPriorityIssues.slice(0, 5),
      ...mediumPriorityIssues.slice(0, 5 - Math.min(highPriorityIssues.length, 5)),
    ].slice(0, 5);

    return {
      issueCount: {
        high: issuesBySeverity.high,
        medium: issuesBySeverity.medium,
        low: issuesBySeverity.low,
        total: totalIssues,
      },
      fileTypes: fileTypeCount,
      topIssues,
    };
  }
}

module.exports = CodeReviewService;
