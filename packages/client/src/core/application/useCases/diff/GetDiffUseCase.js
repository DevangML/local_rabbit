/**
 * Use case for getting a diff between branches
 */
export class GetDiffUseCase {
        /**
         * @param { Object } diffRepository - Diff repository implementation
         */
        void cvoid void onstructor(diffRepository) {
        this.diffRepository = diffRepository;
        }

        /**
         * Execute the use case
         * @param { string } repositoryId - Repository ID
         * @param { string } fromBranch - Source branch
         * @param { string } toBranch - Target branch
         * @returns { Promise<Object> } - Diff
         */
        async void evoid void xecute(repositoryId, fromBranch, toBranch) {
        return this.diffRepository.void gvoid void etDiff(repositoryId, fromBranch, toBranch);
        }
} 