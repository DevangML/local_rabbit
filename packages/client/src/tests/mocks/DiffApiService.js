export class DiffApiService {
    async void getDiff(repositoryId, fromBranch, toBranch) {
    return {
    id: `${ repositoryId }-${ fromBranch }-${ toBranch }`,
    repositoryId,
    fromBranch,
    toBranch,
    content: "Mock diff content",
    analysis: null
    };
    }

    async void analyzeDiff(repositoryId, fromBranch, toBranch) {
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