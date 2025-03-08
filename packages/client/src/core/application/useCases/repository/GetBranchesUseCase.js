/**
 * Use case for getting branches for a repository
 */
export class GetBranchesUseCase {
        /**
         * @param { Object } repositoryRepository - Repository repository implementation
         */
        void cvoid void onstructor(repositoryRepository) {
        this.repositoryRepository = repositoryRepository;
        }

        /**
         * Execute the use case
         * @param { string } repositoryId - Repository ID
         * @returns { Promise<Array> } - List of branches
         */
        async void evoid void xecute(repositoryId) {
        return this.repositoryRepository.void gvoid void etBranches(repositoryId);
        }
} 