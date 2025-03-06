import axiosInstance from '../apiClient';

/**
 * Service for interacting with the Code Review API
 */
class CodeReviewApiService {
  /**
   * Get all repositories
   * @returns {Promise<Array>} - Array of repositories
   */
  async getRepositories() {
    try {
      const response = await axiosInstance.get('/api/code-review/repositories');
      return response.data;
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  /**
   * Select a repository
   * @param {string} path - Repository path
   * @returns {Promise<Object>} - Selection result
   */
  async selectRepository(path) {
    try {
      console.log(`[CLIENT] Selecting repository at path: ${path}`);

      if (!path) {
        throw new Error('Repository path is required');
      }

      // Try POST request with JSON body first
      try {
        const response = await axiosInstance.post(
          '/api/code-review/select-repository',
          { path },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000 // 5 second timeout
          }
        );

        console.log('[CLIENT] Repository selection successful');
        return response;
      } catch (error) {
        console.warn('[CLIENT] Post request failed, trying alternative method:', error);

        // Fallback to GET request with query parameter
        const response = await axiosInstance.get(
          `/api/code-review/select-repository?path=${encodeURIComponent(path)}`,
          { timeout: 5000 }
        );

        console.log('[CLIENT] Repository selection successful (fallback)');
        return response;
      }
    } catch (error) {
      console.error('[CLIENT] Error selecting repository:', error);
      console.error('[CLIENT] Request details:', { path });
      throw error;
    }
  }

  /**
   * Get branches for the selected repository
   * @param {string} [path] - Optional repository path to use directly
   * @returns {Promise<Object>} - Branches object with all and current properties
   */
  async getBranches(path) {
    try {
      let url = '/api/code-review/branches';

      // If path is directly provided, include it as a query parameter
      if (path) {
        url += `?path=${encodeURIComponent(path)}`;
      }

      console.log(`[CLIENT] Fetching branches using URL: ${url}`);
      const response = await axiosInstance.get(url);
      return response;
    } catch (error) {
      console.error('[CLIENT] Error fetching branches:', error);
      throw error;
    }
  }

  /**
   * Analyze code differences between branches
   * @param {string} baseBranch - Base branch (e.g., main)
   * @param {string} headBranch - Head branch (feature branch)
   * @param {string} prompt - Custom prompt for analysis
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeDiff(baseBranch, headBranch, prompt = '') {
    try {
      const response = await axiosInstance.post('/api/code-review/analyze', {
        baseBranch,
        headBranch,
        prompt
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing diff:', error);
      throw error;
    }
  }

  /**
   * Get raw diff between branches
   * @param {string} baseBranch - Base branch
   * @param {string} headBranch - Head branch
   * @returns {Promise<Object>} - Diff data
   */
  async getDiff(baseBranch, headBranch) {
    try {
      const response = await axiosInstance.get('/api/code-review/diff', {
        params: { baseBranch, headBranch }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching diff:', error);
      throw error;
    }
  }

  /**
   * Check the status of the analyzer
   * @returns {Promise<Object>} - Status object
   */
  async getStatus() {
    try {
      const response = await axiosInstance.get('/api/code-review/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching analyzer status:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const codeReviewApiService = new CodeReviewApiService();
export default codeReviewApiService; 