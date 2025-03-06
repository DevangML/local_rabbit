const path = require('path');
const _fs = require('fs');
const { execSync } = require('child_process');
const axios = require('axios');
const logger = require('../utils/logger');

class CodeReviewService {
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
  }

  /**
   * Review code changes in a pull request
   * @param {string} repoPath - Path to the repository
   * @param {string} baseBranch - Base branch (e.g., main)
   * @param {string} headBranch - Head branch (feature branch)
   * @returns {Promise<Object>} - Review results
   */
  async reviewPullRequest(repoPath, baseBranch, headBranch) {
    try {
      // Get the diff between branches
      const diffOutput = await this.getDiffBetweenBranches(repoPath, baseBranch, headBranch);

      // Parse the diff into files
      const files = await this.parseGitDiff(diffOutput);

      // Analyze files in chunks to optimize token usage
      const reviewResults = await this.analyzeFilesWithTokenOptimization(files);

      return {
        summary: this.generateSummary(reviewResults),
        files: reviewResults,
      };
    } catch (error) {
      logger.error('Error reviewing pull request:', error);
      throw new Error(`Failed to review pull request: ${error.message}`);
    }
  }

  /**
   * Get diff between two branches
   * @param {string} repoPath - Repository path
   * @param {string} baseBranch - Base branch
   * @param {string} headBranch - Head branch
   * @returns {Promise<string>} - Git diff output
   */
  async getDiffBetweenBranches(repoPath, baseBranch, headBranch) {
    try {
      const diffCommand = `git diff ${baseBranch}...${headBranch}`;
      const diffOutput = execSync(diffCommand, { cwd: repoPath, maxBuffer: 10 * 1024 * 1024 }).toString();
      return diffOutput;
    } catch (error) {
      logger.error('Error getting diff between branches:', error);
      throw new Error(`Failed to get diff between branches: ${error.message}`);
    }
  }

  /**
   * Parse git diff output into structured file objects
   * @param {string} diffOutput - Git diff output
   * @returns {Promise<Array>} - Array of file objects
   */
  async parseGitDiff(diffOutput) {
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
        const hunks = [];

        if (hunkMatches.length > 0) {
          for (let i = 0; i < hunkMatches.length; i++) {
            const currentMatchIndex = hunkMatches[i].index;
            const nextMatchIndex = i < hunkMatches.length - 1 ? hunkMatches[i + 1].index : fileDiff.length;
            const hunkContent = fileDiff.substring(currentMatchIndex, nextMatchIndex);
            hunks.push(hunkContent);
          }
        }

        files.push({
          path: filePath,
          extension,
          hunks,
          content: fileDiff,
          type: this.getFileType(extension),
        });
      } catch (error) {
        logger.warn(`Error parsing diff for a file: ${error.message}`);
      }
    }

    return files;
  }

  /**
   * Get file type based on extension
   * @param {string} extension - File extension
   * @returns {string} - File type
   */
  getFileType(extension) {
    const fileTypes = {
      js: 'JavaScript',
      jsx: 'React',
      ts: 'TypeScript',
      tsx: 'React TypeScript',
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
      yml: 'YAML',
      yaml: 'YAML',
      css: 'CSS',
      scss: 'SCSS',
      html: 'HTML',
      xml: 'XML',
    };

    return fileTypes[extension] || 'Unknown';
  }

  /**
   * Analyze files with token optimization
   * @param {Array} files - Array of file objects
   * @returns {Promise<Array>} - Analysis results for each file
   */
  async analyzeFilesWithTokenOptimization(files) {
    // Group files by type to enable domain-specific analysis
    const filesByType = this.groupFilesByType(files);
    const results = [];

    // Process each file type group
    for (const [type, typeFiles] of Object.entries(filesByType)) {
      // Further chunk the files within each type to optimize token usage
      const fileChunks = this.chunkFilesByTokenSize(typeFiles);

      for (const chunk of fileChunks) {
        try {
          // Get language-specific review for this chunk
          const chunkReviews = await this.getAIReviewForChunk(chunk, type);
          results.push(...chunkReviews);
        } catch (error) {
          logger.error(`Error reviewing ${type} files chunk:`, error);
          // Add basic info for files that failed analysis
          chunk.forEach((file) => {
            results.push({
              path: file.path,
              type: file.type,
              issues: [{ title: 'Analysis failed', severity: 'low' }],
              suggestions: ['File could not be analyzed due to an error.'],
            });
          });
        }
      }
    }

    return results;
  }

  /**
   * Group files by their type for more focused analysis
   * @param {Array} files - Array of file objects
   * @returns {Object} - Files grouped by type
   */
  groupFilesByType(files) {
    const filesByType = {};

    for (const file of files) {
      if (!filesByType[file.type]) {
        filesByType[file.type] = [];
      }
      filesByType[file.type].push(file);
    }

    return filesByType;
  }

  /**
   * Chunk files based on estimated token size to optimize API calls
   * @param {Array} files - Array of file objects
   * @returns {Array} - Array of file chunks
   */
  chunkFilesByTokenSize(files) {
    const chunks = [];
    let currentChunk = [];
    let currentTokens = 0;

    for (const file of files) {
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

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Get AI review for a chunk of files
   * @param {Array} files - Array of file objects
   * @param {string} fileType - Type of files being reviewed
   * @returns {Promise<Array>} - Review results
   */
  async getAIReviewForChunk(files, fileType) {
    // Create optimized prompt that focuses analysis on the specific file type
    const prompt = this.createTypeSpecificPrompt(files, fileType);

    // Call Gemini API
    const response = await this.callGeminiAPI(prompt);

    // Parse and validate the response
    return this.parseReviewResponse(response, files);
  }

  /**
   * Create type-specific prompt for better analysis
   * @param {Array} files - Array of file objects
   * @param {string} fileType - Type of files being reviewed
   * @returns {string} - Enhanced prompt
   */
  createTypeSpecificPrompt(files, fileType) {
    // Language-specific guidelines based on file type
    const languageGuidelines = {
      JavaScript: 'Focus on modern JS practices, ES6+ features, potential memory leaks, and performance issues.',
      TypeScript: 'Check for proper type usage, interface definitions, and type safety issues.',
      Python: 'Focus on PEP 8 compliance, Pythonic patterns, and common anti-patterns.',
      Java: 'Check for OOP best practices, thread safety issues, and performance considerations.',
      // Add more language-specific guidelines as needed
    };

    const guidelines = languageGuidelines[fileType] || 'Focus on code quality, maintainability, and potential bugs.';

    // Create compact diff representation with only essential information
    const filesDiffSummary = files.map((file) => ({
      path: file.path,
      hunks: file.hunks.length > 0 ? file.hunks : ['File changed'],
    }));

    return `
You are a senior ${fileType} developer performing a code review. Review the following file changes.

${guidelines}

For each file, identify:
1. Potential bugs or errors
2. Performance issues
3. Security vulnerabilities
4. Code style and maintainability concerns
5. Suggested improvements

Format your response as JSON with the following structure for each file:
{
  "files": [
    {
      "path": "file path",
      "issues": [
        {
          "title": "Brief issue title",
          "description": "Detailed description",
          "severity": "high|medium|low",
          "line": "line number or range (if applicable)"
        }
      ],
      "suggestions": [
        "Specific actionable suggestion"
      ]
    }
  ]
}

Here are the code changes to review:
${JSON.stringify(filesDiffSummary, null, 2)}
`;
  }

  /**
   * Call the Gemini API
   * @param {string} prompt - Enhanced prompt
   * @returns {Promise<Object>} - Raw API response
   */
  async callGeminiAPI(prompt) {
    if (!this.apiKey || this.apiKey === 'your-gemini-api-key-here') {
      throw new Error('Gemini API key is missing or invalid. Please set a valid API key in your .env file.');
    }

    // Debug: Log API key information right before the call
    const keyLength = this.apiKey.length;
    const firstChars = this.apiKey.substring(0, 4);
    const lastChars = this.apiKey.substring(keyLength - 4);
    logger.info(`[API CALL] Using Gemini API key with length ${keyLength}. Key: ${firstChars}...${lastChars}`);
    logger.info(`[API CALL] Making request to: ${this.baseUrl}`);

    const url = `${this.baseUrl}?key=${this.apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096, // Limit output tokens
      }
    };

    try {
      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      logger.info(`[API CALL] Successful response from Gemini API`);
      return response.data;
    } catch (error) {
      // Debug: Log detailed error information
      logger.error('[API CALL ERROR] Error calling Gemini API:');
      if (error.response) {
        logger.error(`[API CALL ERROR] Status: ${error.response.status}`);
        logger.error(`[API CALL ERROR] Data: ${JSON.stringify(error.response.data, null, 2)}`);
        logger.error(`[API CALL ERROR] Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
      } else if (error.request) {
        logger.error('[API CALL ERROR] No response received');
        logger.error(`[API CALL ERROR] Request: ${JSON.stringify(error.request, null, 2)}`);
      } else {
        logger.error(`[API CALL ERROR] Error message: ${error.message}`);
      }

      // Check specifically for API key errors
      if (error.response?.data?.error?.details?.some(detail =>
        detail.reason === "API_KEY_INVALID" || detail.reason === "API_KEY_EXPIRED")) {
        logger.error('[API CALL ERROR] Invalid Gemini API key. Please check your API key and ensure it is valid.');
        throw new Error('Invalid Gemini API key. Please get a valid key from https://ai.google.dev/');
      }

      // Throw a general error for other cases
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Parse the review response from Gemini API
   * @param {Object} response - Raw API response
   * @param {Array} originalFiles - Original files that were analyzed
   * @returns {Array} - Parsed file reviews
   */
  parseReviewResponse(response, originalFiles) {
    try {
      // Extract text content from Gemini response
      const textContent = response.candidates[0].content.parts[0].text;

      // Find JSON in the response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      // Parse the JSON
      const jsonResponse = JSON.parse(jsonMatch[0]);

      // Ensure we have file reviews
      if (!jsonResponse.files || !Array.isArray(jsonResponse.files)) {
        throw new Error('Invalid response format: missing files array');
      }

      // Match response to original files to ensure all files have reviews
      return this.matchReviewsToOriginalFiles(jsonResponse.files, originalFiles);
    } catch (error) {
      logger.error('Error parsing Gemini response:', error);
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
   * @param {Array} fileReviews - Reviews returned by Gemini
   * @param {Array} originalFiles - Original files that were analyzed
   * @returns {Array} - Complete file reviews
   */
  matchReviewsToOriginalFiles(fileReviews, originalFiles) {
    const reviewsByPath = {};

    // Create lookup by path
    fileReviews.forEach((review) => {
      if (review.path) {
        reviewsByPath[review.path] = review;
      }
    });

    // Ensure all original files have reviews
    return originalFiles.map((file) => {
      const review = reviewsByPath[file.path];

      if (review) {
        return {
          path: file.path,
          type: file.type,
          issues: review.issues || [],
          suggestions: review.suggestions || [],
        };
      }

      // Default for files without reviews
      return {
        path: file.path,
        type: file.type,
        issues: [],
        suggestions: ['No specific issues found.'],
      };
    });
  }

  /**
   * Generate a summary of all file reviews
   * @param {Array} fileReviews - Reviews for all files
   * @returns {Object} - Summary object
   */
  generateSummary(fileReviews) {
    const issuesBySeverity = {
      high: 0,
      medium: 0,
      low: 0,
    };

    // Count issues by severity
    fileReviews.forEach((file) => {
      if (file.issues && Array.isArray(file.issues)) {
        file.issues.forEach((issue) => {
          if (issue.severity && issuesBySeverity[issue.severity] !== undefined) {
            issuesBySeverity[issue.severity]++;
          }
        });
      }
    });

    // Determine overall quality
    let overallQuality = 'good';
    if (issuesBySeverity.high > 0) {
      overallQuality = 'needs work';
    } else if (issuesBySeverity.medium > 3) {
      overallQuality = 'fair';
    }

    // Extract top issues
    const allIssues = fileReviews.flatMap((file) => (file.issues || []).map((issue) => ({
      ...issue,
      file: file.path,
    })));

    const highPriorityIssues = allIssues
      .filter((issue) => issue.severity === 'high')
      .slice(0, 3);

    return {
      filesAnalyzed: fileReviews.length,
      issueCount: {
        total: Object.values(issuesBySeverity).reduce((a, b) => a + b, 0),
        ...issuesBySeverity,
      },
      overallQuality,
      topIssues: highPriorityIssues,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = CodeReviewService;
