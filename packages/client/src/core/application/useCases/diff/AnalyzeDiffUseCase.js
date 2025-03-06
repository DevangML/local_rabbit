/**
 * Use case for analyzing a diff between branches
 */
export class AnalyzeDiffUseCase {
  /**
   * @param {Object} diffRepository - Diff repository implementation
   */
  constructor(diffRepository) {
    this.diffRepository = diffRepository;
  }

  /**
   * Execute the use case
   * @param {string} repositoryId - Repository ID
   * @param {string} fromBranch - Source branch
   * @param {string} toBranch - Target branch
   * @returns {Promise<Object>} - Analyzed diff
   */
  async execute(repositoryId, fromBranch, toBranch) {
    return this.diffRepository.analyzeDiff(repositoryId, fromBranch, toBranch);
  }
} 