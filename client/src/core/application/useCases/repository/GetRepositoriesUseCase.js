/**
 * Use case for getting all repositories
 */
export class GetRepositoriesUseCase {
  /**
   * @param {Object} repositoryRepository - Repository repository implementation
   */
  constructor(repositoryRepository) {
    this.repositoryRepository = repositoryRepository;
  }

  /**
   * Execute the use case
   * @returns {Promise<Array>} - List of repositories
   */
  async execute() {
    return this.repositoryRepository.getAll();
  }
} 