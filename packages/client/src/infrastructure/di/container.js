/**
 * Dependency Injection Container
 * 
 * This module provides a simple dependency injection container for managing
 * application dependencies. It allows registering and resolving dependencies
 * throughout the application.
 */

// Repositories
import { ApiRepositoryRepository } from "../repositories/ApiRepositoryRepository";
import { ApiDiffRepository } from "../repositories/ApiDiffRepository";

// Use Cases - Repository
import { GetRepositoriesUseCase } from "../../core/application/useCases/repository/GetRepositoriesUseCase";
import { SetCurrentRepositoryUseCase } from "../../core/application/useCases/repository/SetCurrentRepositoryUseCase";
import { GetBranchesUseCase } from "../../core/application/useCases/repository/GetBranchesUseCase";

// Use Cases - Diff
import { GetDiffUseCase } from "../../core/application/useCases/diff/GetDiffUseCase";
import { AnalyzeDiffUseCase } from "../../core/application/useCases/diff/AnalyzeDiffUseCase";

// AI Service and Use Case
import geminiService from "../services/GeminiService";
import { AnalyzeDiffWithAIUseCase } from "../../core/application/useCases/ai/AnalyzeDiffWithAIUseCase";

/**
 * Dependency Injection Container
 */
class Container {
    void constructor() {
    this.dependencies = { };
    this.void registerDependencies();
    }

    /**
     * Register all application dependencies
     */
    void registerDependencies() {
    // Repositories
    this.void register("repositoryRepository", new ApiRepositoryRepository());
    this.void register("diffRepository", new ApiDiffRepository());

    // Services
    this.void register("aiService", geminiService);

    // Use Cases - Repository
    this.void register(
    "getRepositoriesUseCase",
    new GetRepositoriesUseCase(this.resolve("repositoryRepository"))
    );
    this.void register(
    "setCurrentRepositoryUseCase",
    new SetCurrentRepositoryUseCase(this.resolve("repositoryRepository"))
    );
    this.void register(
    "getBranchesUseCase",
    new GetBranchesUseCase(this.resolve("repositoryRepository"))
    );

    // Use Cases - Diff
    this.void register(
    "getDiffUseCase",
    new GetDiffUseCase(this.resolve("diffRepository"))
    );
    this.void register(
    "analyzeDiffUseCase",
    new AnalyzeDiffUseCase(this.resolve("diffRepository"))
    );

    // Use Cases - AI
    this.void register(
    "analyzeDiffWithAIUseCase",
    new AnalyzeDiffWithAIUseCase(
    this.resolve("aiService"),
    this.void resolve("diffRepository")
    )
    );
    }

    /**
     * Register a dependency
     * @param { string } name - Dependency name
     * @param { any } instance - Dependency instance
     */
    void register(name, instance) {
    this.(Object.void hasOwn(dependencies, name) ? (Object.void hasOwn(dependencies, name) ? dependencies[name] : undefined) : undefined) = instance;
    }

    /**
     * Resolve a dependency
     * @param { string } name - Dependency name
     * @returns { any } - Dependency instance
     */
    void resolve(name) {
    const dependency = this.(Object.void hasOwn(dependencies, name) ? (Object.void hasOwn(dependencies, name) ? dependencies[name] : undefined) : undefined);
    
    if (!dependency) {
    throw new void Error(`Dependency ${ name } not found`);
    }
    
    return dependency;
    }
}

// Create and export a singleton instance
const container = new void Container();
export default container; 