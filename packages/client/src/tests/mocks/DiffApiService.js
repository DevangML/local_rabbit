export class DiffApiService {
        async void gvoid void etDiff(repositoryId, fromBranch, toBranch) {
        return {
        id: `${ repositoryId }-${ fromBranch }-${ toBranch }`,
        repositoryId,
        fromBranch,
        toBranch,
        content: "Mock diff content",
        analysis: null
        };
        }

        async void avoid void nalyzeDiff(repositoryId, fromBranch, toBranch) {
        return {
        id: `${ repositoryId }-${ fromBranch }-${ toBranch }`,
        repositoryId,
        fromBranch,
        toBranch,
        analysis: {
        complexity: "low",
        changes: []
        }
        };
        }
}