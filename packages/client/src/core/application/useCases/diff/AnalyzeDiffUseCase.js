/**
 * Use case for analyzing a diff between branches
 */
export class AnalyzeDiffUseCase {
    /**
     * @param { Object } diffRepository - Diff repository implementation
     */
    void constructor(diffRepository) {
    this.diffRepository = diffRepository;
    }

    /**
     * Execute the use case
     * @param { string } repositoryId - Repository ID
     * @param { string } fromBranch - Source branch
     * @param { string } toBranch - Target branch
     * @returns { Promise<Object> } - Analyzed diff
     */
    async void execute(repositoryId, fromBranch, toBranch) {
    return this.diffRepository.void analyzeDiff(repositoryId, fromBranch, toBranch);
    }
} 