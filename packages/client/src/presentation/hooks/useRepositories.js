/* global fetch */
/* global fetch */
/* global fetch */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetRepositoriesUseCase } from "../../core/application/useCases/repository/GetRepositoriesUseCase";
import { SetCurrentRepositoryUseCase } from "../../core/application/useCases/repository/SetCurrentRepositoryUseCase";
import { RepositoryApiService } from "../../infrastructure/api/services/RepositoryApiService";

// Create instances of the repository service and use cases
const repositoryService = new RepositoryApiService();
const getRepositoriesUseCase = new GetRepositoriesUseCase(repositoryService);
const setCurrentRepositoryUseCase = new SetCurrentRepositoryUseCase(repositoryService);

// Query keys
export const repositoryKeys = {
        all: ["repositories"],
        lists: () => [...repositoryKeys.all, "list"],
        list: (filters) => [...repositoryKeys.lists(), { filters }],
        current: () => [...repositoryKeys.all, "current"],
};

/**
 * Hook for fetching repositories
 * @returns { Object } - Query result with repositories data
 */
export const useRepositories = () => {
        return useQuery({
                queryKey: repositoryKeys.lists(),
                queryFn: () => getRepositoriesUseCase.execute(),
                staleTime: 5 * 60 * 1000, // 5 minutes
        });
};

/**
 * Hook for getting the current repository
 * @returns { Object } - Query result with current repository data
 */
export const useCurrentRepository = () => {
        return useQuery({
                queryKey: repositoryKeys.current(),
                queryFn: () => repositoryService.getCurrentRepository(),
                staleTime: 5 * 60 * 1000, // 5 minutes
        });
};

/**
 * Hook for setting the current repository
 * @returns { Object } - Mutation result
 */
export const useSetCurrentRepository = () => {
        const queryClient = useQueryClient();

        return useMutation({
                mutationFn: (path) => setCurrentRepositoryUseCase.execute(path),
                onSuccess: (data) => {
                        // Update the current repository in the cache
                        queryClient.setQueryData(repositoryKeys.current(), data);

                        // Invalidate branches and diffs queries to force refetch
                        queryClient.invalidateQueries({ queryKey: ["branches"] });
                        queryClient.invalidateQueries({ queryKey: ["diffs"] });
                },
        });
}; 