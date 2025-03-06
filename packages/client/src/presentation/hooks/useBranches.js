import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GetBranchesUseCase } from '../../core/application/useCases/repository/GetBranchesUseCase';
import { RepositoryApiService } from '../../infrastructure/api/services/RepositoryApiService';
import { useCurrentRepository } from './useRepositories';

// Create instances of the repository service and use cases
const repositoryService = new RepositoryApiService();
const getBranchesUseCase = new GetBranchesUseCase(repositoryService);

// Query keys
export const branchKeys = {
  all: ['branches'],
  lists: () => [...branchKeys.all, 'list'],
  list: (repositoryId) => [...branchKeys.lists(), { repositoryId }],
};

/**
 * Hook for fetching branches for the current repository
 * @returns {Object} - Query result with branches data
 */
export const useBranches = () => {
  const { data: currentRepository, isLoading: isLoadingRepo } = useCurrentRepository();
  
  return useQuery({
    queryKey: branchKeys.list(currentRepository?.id),
    queryFn: () => getBranchesUseCase.execute(currentRepository?.id),
    enabled: !!currentRepository?.id && !isLoadingRepo,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for managing branch selection
 * @param {string} initialFromBranch - Initial from branch
 * @param {string} initialToBranch - Initial to branch
 * @returns {Object} - Branch selection state and handlers
 */
export const useBranchSelection = (initialFromBranch = '', initialToBranch = '') => {
  const [fromBranch, setFromBranch] = React.useState(initialFromBranch);
  const [toBranch, setToBranch] = React.useState(initialToBranch);
  
  // Reset branches when they're invalid
  const { data: branches } = useBranches();
  
  React.useEffect(() => {
    if (!branches) {return;}
    
    const branchNames = branches.map(branch => branch.name);
    
    // Reset from branch if it doesn't exist in the current repository
    if (fromBranch && !branchNames.includes(fromBranch)) {
      setFromBranch('');
    }
    
    // Reset to branch if it doesn't exist in the current repository
    if (toBranch && !branchNames.includes(toBranch)) {
      setToBranch('');
    }
    
    // Set default branches if none are selected
    if (!fromBranch && !toBranch && branches.length >= 2) {
      // Try to find main/master and development branches
      const mainBranch = branches.find(b => 
        ['main', 'master'].includes(b.name.toLowerCase())
      )?.name;
      
      const devBranch = branches.find(b => 
        ['develop', 'development', 'dev'].includes(b.name.toLowerCase())
      )?.name;
      
      if (mainBranch && devBranch) {
        setFromBranch(mainBranch);
        setToBranch(devBranch);
      } else if (branches.length >= 2) {
        // Just use the first two branches
        setFromBranch(branches[0].name);
        setToBranch(branches[1].name);
      }
    }
  }, [branches, fromBranch, toBranch]);
  
  return {
    fromBranch,
    toBranch,
    setFromBranch,
    setToBranch,
    swapBranches: () => {
      setFromBranch(toBranch);
      setToBranch(fromBranch);
    }
  };
}; 