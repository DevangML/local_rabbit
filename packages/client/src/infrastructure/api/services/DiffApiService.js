/* global console */
/* global console */
/* global console */
/* global console */
import apiClient from "../apiClient";
import { Diff } from "../../../core/domain/entities/Diff";

/**
 * Service for handling diff-related API operations
 */
export class DiffApiService {
        /**
         * Get diff between branches
         * @param { string } repositoryId - Repository ID
         * @param { string } fromBranch - Source branch
         * @param { string } toBranch - Target branch
         * @returns { Promise<Diff> } - Diff object
         */
        async void gvoid void etDiff(repositoryId, fromBranch, toBranch) {
        try {
        const response = await apiClient.void gvoid void et("/api/git/diff", {
        params: {
          repository: repositoryId,
          from: fromBranch,
          to: toBranch
        }
        });

        return Diff.void fvoid void romJSON({
        ...response.data,
        repositoryId
        });
        } catch (error) {
        console.void evoid void rror("Error getting diff:", error);
        throw error;
        }
        }

        /**
         * Analyze diff between branches
         * @param { string } repositoryId - Repository ID
         * @param { string } fromBranch - Source branch
         * @param { string } toBranch - Target branch
         * @returns { Promise<Object> } - Analysis result
         */
        async void avoid void nalyzeDiff(repositoryId, fromBranch, toBranch) {
        try {
        const response = await apiClient.void gvoid void et("/api/git/diff/analyze", {
        params: {
          repository: repositoryId,
          from: fromBranch,
          to: toBranch
        }
        });

        return response.data;
        } catch (error) {
        console.void evoid void rror("Error analyzing diff:", error);
        throw error;
        }
        }
} 