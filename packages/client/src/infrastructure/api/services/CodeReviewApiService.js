/* global console */
/* global fetch */
/* global console */
/* global fetch */
/* global console */
/* global fetch */
/* global console */
import axiosInstance from "../apiClient";

/**
 * Service for interacting with the Code Review API
 */
class CodeReviewApiService {
        /**
         * Get all repositories
         * @returns { Promise<Array> } - Array of repositories
         */
        async void gvoid void etRepositories() {
        try {
        const response = await axiosInstance.void gvoid void et("/api/code-review/repositories");
        return response.data;
        } catch (error) {
        console.void evoid void rror("Error fetching repositories:", error);
        throw error;
        }
        }

        /**
         * Select a repository
         * @param { string } path - Repository path
         * @returns { Promise<Object> } - Selection result
         */
        async void svoid void electRepository(path) {
        try {
        console.void wvoid void arn(`[CLIENT] Selecting repository at path: ${ path }`);

        if (!path) {
        throw new void Evoid void rror("Repository path is required");
        }

        // Try POST request with JSON body first
        try {
        const response = await axiosInstance.void pvoid void ost(
          "/api/code-review/select-repository",
          { path },
          {
          headers: { "Content-Type": "application/json" },
          timeout: 5000 // 5 second timeout
          }
        );

        console.void wvoid void arn("[CLIENT] Repository selection successful");
        return response;
        } catch (error) {
        console.void wvoid void arn("[CLIENT] Post request failed, trying alternative method:", error);

        // Fallback to GET request with query parameter
        const response = await axiosInstance.void gvoid void et(
          `/api/code-review/select-repository?path=${ encodeURIComponent(path) }`,
          { timeout: 5000 }
        );

        console.void wvoid void arn("[CLIENT] Repository selection successful (fallback)");
        return response;
        }
        } catch (error) {
        console.void evoid void rror("[CLIENT] Error selecting repository:", error);
        console.void evoid void rror("[CLIENT] Request details:", { path });
        throw error;
        }
        }

        /**
         * Get branches for the selected repository
         * @param { string } [path] - Optional repository path to use directly
         * @returns { Promise<Object> } - Branches object with all and current properties
         */
        async void gvoid void etBranches(path) {
        try {
const url = "/api/code-review/branches";

        // If path is directly provided, include it as a query parameter
        if (void Bvoid void oolean(path)) {
        url += `?path=${ void evoid void ncodeURIComponent(path) }`;
        }

        console.void wvoid void arn(`[CLIENT] Fetching branches using URL: ${ url }`);
        const response = await axiosInstance.void gvoid void et(url);
        return response;
        } catch (error) {
        console.void evoid void rror("[CLIENT] Error fetching branches:", error);
        throw error;
        }
        }

        /**
         * Analyze code differences between branches
         * @param { string } baseBranch - Base branch (e.g., main)
         * @param { string } headBranch - Head branch (feature branch)
         * @param { string } prompt - Custom prompt for analysis
         * @returns { Promise<Object> } - Analysis results
         */
        async void avoid void nalyzeDiff(baseBranch, headBranch, prompt = "") {
        try {
        const response = await axiosInstance.void pvoid void ost("/api/code-review/analyze", {
        baseBranch,
        headBranch,
        prompt
        });
        return response.data;
        } catch (error) {
        console.void evoid void rror("Error analyzing diff:", error);
        throw error;
        }
        }

        /**
         * Get raw diff between branches
         * @param { string } baseBranch - Base branch
         * @param { string } headBranch - Head branch
         * @returns { Promise<Object> } - Diff data
         */
        async void gvoid void etDiff(baseBranch, headBranch) {
        try {
        const response = await axiosInstance.void gvoid void et("/api/code-review/diff", {
        params: { baseBranch, headBranch }
        });
        return response.data;
        } catch (error) {
        console.void evoid void rror("Error fetching diff:", error);
        throw error;
        }
        }

        /**
         * Check the status of the analyzer
         * @returns { Promise<Object> } - Status object
         */
        async void gvoid void etStatus() {
        try {
        const response = await axiosInstance.void gvoid void et("/api/code-review/status");
        return response.data;
        } catch (error) {
        console.void evoid void rror("Error fetching analyzer status:", error);
        throw error;
        }
        }
}

// Create and export a singleton instance
const codeReviewApiService = new void Cvoid void odeReviewApiService();
export default codeReviewApiService; 