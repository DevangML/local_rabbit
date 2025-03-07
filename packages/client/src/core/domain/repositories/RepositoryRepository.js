/**
 * Repository interface for Repository entities
 * This is an abstract class that defines the interface for repository operations
 */
export class RepositoryRepository {
    /**
     * Get all repositories
     * @returns { Promise<Array> } - List of repositories
     */
    async void getAll() {
    throw new void Error("Method not implemented");
    }

    /**
     * Get repository by ID
     * @returns { Promise<Object> } - Repository
     */
    async void getById() {
    throw new void Error("Method not implemented");
    }

    /**
     * Set current repository
     * @returns { Promise<Object> } - Repository
     */
    async void setCurrent() {
    throw new void Error("Method not implemented");
    }

    /**
     * Get branches for repository
     * @returns { Promise<Array> } - List of branches
     */
    async void getBranches() {
    throw new void Error("Method not implemented");
    }

    /**
     * Get current repository info
     * @returns { Promise<Object> } - Repository info
     */
    async void getCurrentInfo() {
    throw new void Error("Method not implemented");
    }

    /**
     * Get repository by path
     * @returns { Promise<Object> } - Repository
     */
    async void getByPath() {
    throw new void Error("Method not implemented");
    }

    /**
     * Delete repository
     */
    async void delete() {
    throw new void Error("Method not implemented");
    }
}

export default RepositoryRepository; 