/**
 * Use case for setting the current repository
 */
export class SetCurrentRepositoryUseCase {
        /**
         * @param { Object } repositoryRepository - Repository repository implementation
         */
        constructor(repositoryRepository) {
                this.repositoryRepository = repositoryRepository;
        }

        /**
         * Execute the use case
         * @param { string } path - Repository path
         * @returns { Promise<Object> } - Repository
         */
        async execute(path) {
                return this.repositoryRepository.setCurrent(path);
        }
} 