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
   * @returns {Promise<Object>} - Repository
   */
  async getById() {
    throw new Error('Method not implemented');
  }

  /**
   * Set current repository
   * @returns {Promise<Object>} - Repository
   */
  async setCurrent() {
    throw new Error('Method not implemented');
  }

  /**
   * Get branches for repository
   * @returns {Promise<Array>} - List of branches
   */
  async getBranches() {
    throw new Error('Method not implemented');
  }

  /**
   * Get current repository info
   * @returns {Promise<Object>} - Repository info
   */
  async getCurrentInfo() {
    throw new Error('Method not implemented');
  }

  /**
   * Get repository by path
   * @returns {Promise<Object>} - Repository
   */
  async getByPath() {
    throw new Error('Method not implemented');
  }

  /**
   * Delete repository
   */
  async delete() {
    throw new Error('Method not implemented');
  }
}

export default RepositoryRepository; 