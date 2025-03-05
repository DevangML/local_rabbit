import { useQuery, useMutation } from '@tanstack/react-query';
import { GetDiffUseCase } from '../../core/application/useCases/diff/GetDiffUseCase';
import { AnalyzeDiffUseCase } from '../../core/application/useCases/diff/AnalyzeDiffUseCase';
import { DiffApiService } from '../../infrastructure/api/services/DiffApiService';
import { GeminiApiService } from '../../infrastructure/api/services/GeminiApiService';
import { useCurrentRepository } from './useRepositories';

// Create instances of the services and use cases
const diffApiService = new DiffApiService();
const geminiApiService = new GeminiApiService();
const getDiffUseCase = new GetDiffUseCase(diffApiService);
const analyzeDiffUseCase = new AnalyzeDiffUseCase(diffApiService);

// Query keys
export const diffKeys = {
  all: ['diffs'],
  diff: (repositoryId, fromBranch, toBranch) => [
    ...diffKeys.all, 
    { repositoryId, fromBranch, toBranch }
  ],
  analysis: (repositoryId, fromBranch, toBranch) => [
    ...diffKeys.all, 
    'analysis', 
    { repositoryId, fromBranch, toBranch }
  ],
  aiAnalysis: (repositoryId, fromBranch, toBranch) => [
    ...diffKeys.all, 
    'ai-analysis', 
    { repositoryId, fromBranch, toBranch }
  ],
};

/**
 * Hook for fetching diff between branches
 * @param {string} fromBranch - Source branch
 * @param {string} toBranch - Target branch
 * @returns {Object} - Query result with diff data
 */
export const useDiff = (fromBranch, toBranch) => {
  const { data: currentRepository } = useCurrentRepository();
  
  return useQuery({
    queryKey: diffKeys.diff(
      currentRepository?.id, 
      fromBranch, 
      toBranch
    ),
    queryFn: () => getDiffUseCase.execute(
      currentRepository?.id, 
      fromBranch, 
      toBranch
    ),
    enabled: !!currentRepository?.id && !!fromBranch && !!toBranch,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for analyzing diff between branches
 * @param {string} fromBranch - Source branch
 * @param {string} toBranch - Target branch
 * @returns {Object} - Query result with analysis data
 */
export const useDiffAnalysis = (fromBranch, toBranch) => {
  const { data: currentRepository } = useCurrentRepository();
  
  return useQuery({
    queryKey: diffKeys.analysis(
      currentRepository?.id, 
      fromBranch, 
      toBranch
    ),
    queryFn: () => analyzeDiffUseCase.execute(
      currentRepository?.id, 
      fromBranch, 
      toBranch
    ),
    enabled: false, // Manual trigger only
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for analyzing diff with AI
 * @returns {Object} - Mutation result
 */
export const useAIDiffAnalysis = () => {
  return useMutation({
    mutationFn: async ({ 
      repositoryId, 
      fromBranch, 
      toBranch, 
      prompt = '' 
    }) => {
      // Get the diff first
      const diff = await getDiffUseCase.execute(
        repositoryId, 
        fromBranch, 
        toBranch
      );
      
      // Then analyze with AI
      return geminiApiService.analyzeDiff(diff, prompt);
    }
  });
}; 