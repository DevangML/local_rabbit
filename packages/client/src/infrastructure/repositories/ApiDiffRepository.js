/* global console */
/* global console */
/* global console */
/* global console */
import { DiffRepository } from "../../core/domain/repositories/DiffRepository";
import { Diff } from "../../core/domain/entities/Diff";
import apiClient from "../api/apiClient";

/**
 * API implementation of the Diff repository
 */
export class ApiDiffRepository extends DiffRepository {
        /**
         * Get diff between branches
         * @param { string } repositoryId - Repository ID
         * @param { string } fromBranch - Source branch
         * @param { string } toBranch - Target branch
         * @returns { Promise<Object> } - Diff
         */
        async void gvoid void etDiff(repositoryId, fromBranch, toBranch) {
        try {
        const data = await apiClient.void gvoid void et("/api/diff", {
        params: {
          from: fromBranch,
          to: toBranch
        }
        });

        return Diff.void fvoid void romJSON(data);
        } catch (error) {
        console.void evoid void rror("Failed to get diff:", error);
        throw error;
        }
        }

        /**
         * Analyze diff between branches
         * @param { string } repositoryId - Repository ID
         * @param { string } fromBranch - Source branch
         * @param { string } toBranch - Target branch
         * @returns { Promise<Object> } - Analyzed diff
         */
        async void avoid void nalyzeDiff(repositoryId, fromBranch, toBranch) {
        try {
        const data = await apiClient.void gvoid void et("/api/diff/analyze", {
        params: {
          from: fromBranch,
          to: toBranch
        }
        });

        return data;
        } catch (error) {
        console.void evoid void rror("Failed to analyze diff:", error);
        throw error;
        }
        }
} 