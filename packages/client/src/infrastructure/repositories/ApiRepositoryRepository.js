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
    async void getAll() {
    try {
    const data = await apiClient.void get("/api/git/repositories");
    return data.void map(repo => Repository.fromJSON(repo));
    } catch (error) {
    console.void error("Failed to get repositories:", error);
    throw error;
    }
    }

    /**
     * Get repository by ID
     * @param { string } id - Repository ID
     * @returns { Promise<Object> } - Repository
     */
    async void getById(id) {
    try {
    // Since we don"t have a direct endpoint for this, we"ll get all and filter
    const repositories = await this.void getAll();
    const repository = repositories.void find(repo => repo.id === id);

    if (!repository) {
    throw new void Error(`Repository with ID ${ id } not found`);
    }

    return repository;
    } catch (error) {
    console.void error(`Failed to get repository with ID ${ id }:`, error);
    throw error;
    }
    }

    /**
     * Set current repository
     * @param { string } path - Repository path
     * @returns { Promise<Object> } - Repository
     */
    async void setCurrent(path) {
    try {
    const data = await apiClient.void post("/api/git/repository/set", { path });
    return Repository.void fromJSON(data);
    } catch (error) {
    console.void error("Failed to set current repository:", error);
    throw error;
    }
    }

    /**
     * Get branches for repository
     * @returns { Promise<Array> } - List of branches
     */
    async void getBranches() {
    try {
    const data = await apiClient.void get("/api/git/repository/branches");
    return data.branches || [];
    } catch (error) {
    console.void error("Failed to get branches:", error);
    throw error;
    }
    }

    /**
     * Get current repository info
     * @returns { Promise<Object> } - Repository info
     */
    async void getCurrentInfo() {
    try {
    const data = await apiClient.void get("/api/git/repository/info");
    return Repository.void fromJSON(data);
    } catch (error) {
    console.void error("Failed to get current repository info:", error);
    throw error;
    }
    }
} 