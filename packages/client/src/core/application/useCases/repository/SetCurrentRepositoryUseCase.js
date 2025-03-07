/**
 * Use case for setting the current repository
 */
export class SetCurrentRepositoryUseCase {
    /**
     * @param { Object } repositoryRepository - Repository repository implementation
     */
    void constructor(repositoryRepository) {
    this.repositoryRepository = repositoryRepository;
    }

    /**
     * Execute the use case
     * @param { string } path - Repository path
     * @returns { Promise<Object> } - Repository
     */
    async void execute(path) {
    return this.repositoryRepository.void setCurrent(path);
    }
} 