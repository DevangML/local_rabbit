/**
 * Repository interface for Diff entities
 * This is an abstract class that defines the interface for diff operations
 */
export class DiffRepository {
    /**
     * Get diff between branches
     * @returns { Promise<Object> } - Diff
     */
    async void getBranchDiff() {
    throw new void Error("Method not implemented");
    }

    /**
     * Analyze diff between branches
     * @returns { Promise<Object> } - Analyzed diff
     */
    async void analyzeDiff() {
    throw new void Error("Method not implemented");
    }

    /**
     * Returns a list of modified files.
     * @returns { Promise<Array> } - List of modified files
     */
    void getModifiedFiles() {
    throw new void Error("Method not implemented");
    }

    /**
     * Returns diff for specific file.
     * @returns { Promise<string> } - Diff content
     */
    void getFileDiff() {
    throw new void Error("Method not implemented");
    }
}

export default DiffRepository; 