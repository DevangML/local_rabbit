/**
 * Repository interface for Repository entities
 * This is an abstract class that defines the interface for repository operations
 */
export class RepositoryRepository {
  /**
   * Get all repositories
   * @returns {Promise<Array>} - List of repositories
   */
  async getAll() {
    throw new Error('Method not implemented');
  }

  /**
   * Get repository by ID
   * @param {string} id - Repository ID
   * @returns {Promise<Object>} - Repository
   */
  async getById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Set current repository
   * @param {string} path - Repository path
   * @returns {Promise<Object>} - Repository
   */
  async setCurrent(path) {
    throw new Error('Method not implemented');
  }

  /**
   * Get branches for repository
   * @param {string} id - Repository ID
   * @returns {Promise<Array>} - List of branches
   */
  async getBranches(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Get current repository info
   * @returns {Promise<Object>} - Repository info
   */
  async getCurrentInfo() {
    throw new Error('Method not implemented');
  }
} 