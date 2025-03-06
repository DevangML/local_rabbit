/**
 * Use case for getting branches for a repository
 */
export class GetBranchesUseCase {
  /**
   * @param {Object} repositoryRepository - Repository repository implementation
   */
  constructor(repositoryRepository) {
    this.repositoryRepository = repositoryRepository;
  }

  /**
   * Execute the use case
   * @param {string} repositoryId - Repository ID
   * @returns {Promise<Array>} - List of branches
   */
  async execute(repositoryId) {
    return this.repositoryRepository.getBranches(repositoryId);
  }
} 