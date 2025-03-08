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
        async getAll() {
                try {
                        const data = await apiClient.get("/api/git/repositories");
                        return data.map(repo => Repository.fromJSON(repo));
                } catch (error) {
                        console.error("Failed to get repositories:", error);
                        throw error;
                }
        }

        /**
         * Get repository by ID
         * @param { string } id - Repository ID
         * @returns { Promise<Object> } - Repository
         */
        async getById(id) {
                try {
                        // Since we don"t have a direct endpoint for this, we"ll get all and filter
                        const repositories = await this.getAll();
                        const repository = repositories.find(repo => repo.id === id);

                        if (!repository) {
                                throw new Error(`Repository with ID ${id} not found`);
                        }

                        return repository;
                } catch (error) {
                        console.error(`Failed to get repository with ID ${id}:`, error);
                        throw error;
                }
        }

        /**
         * Set current repository
         * @param { string } path - Repository path
         * @returns { Promise<Object> } - Repository
         */
        async setCurrent(path) {
                try {
                        const data = await apiClient.post("/api/git/repository/set", { path });
                        return Repository.fromJSON(data);
                } catch (error) {
                        console.error("Failed to set current repository:", error);
                        throw error;
                }
        }

        /**
         * Get branches for repository
         * @returns { Promise<Array> } - List of branches
         */
        async getBranches() {
                try {
                        const data = await apiClient.get("/api/git/repository/branches");
                        return data.branches || [];
                } catch (error) {
                        console.error("Failed to get branches:", error);
                        throw error;
                }
        }

        /**
         * Get current repository info
         * @returns { Promise<Object> } - Repository info
         */
        async getCurrentInfo() {
                try {
                        const data = await apiClient.get("/api/git/repository/info");
                        return Repository.fromJSON(data);
                } catch (error) {
                        console.error("Failed to get current repository info:", error);
                        throw error;
                }
        }
} 