/**
 * Repository interface for Diff entities
 * This is an abstract class that defines the interface for diff operations
 */
export class DiffRepository {
  /**
   * Get diff between branches
   * @param {string} repositoryId - Repository ID
   * @param {string} fromBranch - Source branch
   * @param {string} toBranch - Target branch
   * @returns {Promise<Object>} - Diff
   */
  async getDiff(_repositoryId, _fromBranch, _toBranch) {
    throw new Error('Method not implemented');
  }

  /**
   * Analyze diff between branches
   * @param {string} repositoryId - Repository ID
   * @param {string} fromBranch - Source branch
   * @param {string} toBranch - Target branch
   * @returns {Promise<Object>} - Analyzed diff
   */
  async analyzeDiff(_repositoryId, _fromBranch, _toBranch) {
    throw new Error('Method not implemented');
  }
} 