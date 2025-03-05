// Import path module
import path from 'path';

/**
 * Repository entity representing a Git repository
 */
export class Repository {
  /**
   * @param {string} id - Unique identifier for the repository
   * @param {string} path - File system path to the repository
   * @param {string} name - Repository name
   * @param {string[]} branches - List of branches in the repository
   * @param {string} currentBranch - Currently checked out branch
   */
  constructor(id, path, name, branches = [], currentBranch = '') {
    this.id = id;
    this.path = path;
    this.name = name;
    this.branches = branches;
    this.currentBranch = currentBranch;
  }

  /**
   * Create a Repository instance from raw data
   * @param {Object} data - Raw repository data
   * @returns {Repository} - Repository instance
   */
  static fromJSON(data) {
    return new Repository(
      data.id || data.path, // Use path as ID if no ID is provided
      data.path,
      data.name || path.basename(data.path),
      data.branches || [],
      data.current || ''
    );
  }

  /**
   * Convert Repository to JSON
   * @returns {Object} - JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      path: this.path,
      name: this.name,
      branches: this.branches,
      current: this.currentBranch
    };
  }
} 