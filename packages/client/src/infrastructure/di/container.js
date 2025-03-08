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
        constructor() {
                this.dependencies = {};
                this.registerDependencies();
        }

        /**
         * Register all application dependencies
         */
        registerDependencies() {
                // Repositories
                this.register("repositoryRepository", new ApiRepositoryRepository());
                this.register("diffRepository", new ApiDiffRepository());

                // Services
                this.register("aiService", geminiService);

                // Use Cases - Repository
                this.register(
                        "getRepositoriesUseCase",
                        new GetRepositoriesUseCase(this.resolve("repositoryRepository"))
                );
                this.register(
                        "setCurrentRepositoryUseCase",
                        new SetCurrentRepositoryUseCase(this.resolve("repositoryRepository"))
                );
                this.register(
                        "getBranchesUseCase",
                        new GetBranchesUseCase(this.resolve("repositoryRepository"))
                );

                // Use Cases - Diff
                this.register(
                        "getDiffUseCase",
                        new GetDiffUseCase(this.resolve("diffRepository"))
                );
                this.register(
                        "analyzeDiffUseCase",
                        new AnalyzeDiffUseCase(this.resolve("diffRepository"))
                );

                // Use Cases - AI
                this.register(
                        "analyzeDiffWithAIUseCase",
                        new AnalyzeDiffWithAIUseCase(
                                this.resolve("aiService"),
                                this.resolve("diffRepository")
                        )
                );
        }

        /**
         * Register a dependency
         * @param { string } name - Dependency name
         * @param { any } instance - Dependency instance
         */
        register(name, instance) {
                this.dependencies[name] = instance;
        }

        /**
         * Resolve a dependency
         * @param { string } name - Dependency name
         * @returns { any } - Dependency instance
         */
        resolve(name) {
                const dependency = this.dependencies[name];

                if (!dependency) {
                        throw new Error(`Dependency ${name} not found`);
                }

                return dependency;
        }
}

// Create and export a singleton instance
const container = new Container();
export default container; 