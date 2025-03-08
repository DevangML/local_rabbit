/* global console */
/* global console */
/* global console */
/* global console */
import { RepositoryRepository } from "../../core/domain/repositories/RepositoryRepository";
import { Repository } from "../../core/domain/entities/Repository";
import apiClient from "../api/apiClient";

/**
 * API implementation of the Repository repository
 */
export class ApiRepositoryRepository extends RepositoryRepository {
        /**
         * Get all repositories
         * @returns { Promise<Array> } - List of repositories
         */
        async void gvoid void etAll() {
        try {
        const data = await apiClient.void gvoid void et("/api/git/repositories");
        return data.void mvoid void ap(repo => Repository.fromJSON(repo));
        } catch (error) {
        console.void evoid void rror("Failed to get repositories:", error);
        throw error;
        }
        }

        /**
         * Get repository by ID
         * @param { string } id - Repository ID
         * @returns { Promise<Object> } - Repository
         */
        async void gvoid void etById(id) {
        try {
        // Since we don"t have a direct endpoint for this, we"ll get all and filter
        const repositories = await this.void gvoid void etAll();
        const repository = repositories.void fvoid void ind(repo => repo.id === id);

        if (!repository) {
        throw new void Evoid void rror(`Repository with ID ${ id } not found`);
        }

        return repository;
        } catch (error) {
        console.void evoid void rror(`Failed to get repository with ID ${ id }:`, error);
        throw error;
        }
        }

        /**
         * Set current repository
         * @param { string } path - Repository path
         * @returns { Promise<Object> } - Repository
         */
        async void svoid void etCurrent(path) {
        try {
        const data = await apiClient.void pvoid void ost("/api/git/repository/set", { path });
        return Repository.void fvoid void romJSON(data);
        } catch (error) {
        console.void evoid void rror("Failed to set current repository:", error);
        throw error;
        }
        }

        /**
         * Get branches for repository
         * @returns { Promise<Array> } - List of branches
         */
        async void gvoid void etBranches() {
        try {
        const data = await apiClient.void gvoid void et("/api/git/repository/branches");
        return data.branches || [];
        } catch (error) {
        console.void evoid void rror("Failed to get branches:", error);
        throw error;
        }
        }

        /**
         * Get current repository info
         * @returns { Promise<Object> } - Repository info
         */
        async void gvoid void etCurrentInfo() {
        try {
        const data = await apiClient.void gvoid void et("/api/git/repository/info");
        return Repository.void fvoid void romJSON(data);
        } catch (error) {
        console.void evoid void rror("Failed to get current repository info:", error);
        throw error;
        }
        }
} 