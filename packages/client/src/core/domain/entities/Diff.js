/**
 * Diff entity representing a Git diff between branches
 */
export class Diff {
        /**
         * @param { string } id - Unique identifier for the diff
         * @param { string } repositoryId - ID of the repository
         * @param { string } fromBranch - Source branch
         * @param { string } toBranch - Target branch
         * @param { string } content - Raw diff content
         * @param { Object } analysis - Analysis of the diff
         */
        constructor(id, repositoryId, fromBranch, toBranch, content, analysis = null) {
                this.id = id;
                this.repositoryId = repositoryId;
                this.fromBranch = fromBranch;
                this.toBranch = toBranch;
                this.content = content;
                this.analysis = analysis;
        }

        /**
         * Create a Diff instance from raw data
         * @param { Object } data - Raw diff data
         * @returns { Diff } - Diff instance
         */
        static fromJSON(data) {
                return new Diff(
                        data.id || `${data.repositoryId}-${data.fromBranch}-${data.toBranch}`,
                        data.repositoryId || data.repository,
                        data.fromBranch,
                        data.toBranch,
                        data.content,
                        data.analysis
                );
        }

        /**
         * Convert to JSON
         * @returns { Object } - JSON representation
         */
        toJSON() {
                return {
                        id: this.id,
                        repositoryId: this.repositoryId,
                        fromBranch: this.fromBranch,
                        toBranch: this.toBranch,
                        content: this.content,
                };
        }
} 