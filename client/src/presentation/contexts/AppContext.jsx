import React, { createContext, useContext, useState, useEffect } from 'react';
import container from '../../infrastructure/di/container';

// Create context
const AppContext = createContext(null);

/**
 * Custom hook to use the app context
 * @returns {Object} - App context
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};

/**
 * App context provider component
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Provider component
 */
export const AppProvider = ({ children }) => {
  // State
  const [repositories, setRepositories] = useState([]);
  const [currentRepository, setCurrentRepository] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use cases
  const getRepositoriesUseCase = container.resolve('getRepositoriesUseCase');
  const setCurrentRepositoryUseCase = container.resolve('setCurrentRepositoryUseCase');
  const getBranchesUseCase = container.resolve('getBranchesUseCase');
  const getDiffUseCase = container.resolve('getDiffUseCase');
  const analyzeDiffUseCase = container.resolve('analyzeDiffUseCase');

  // Load repositories on mount
  useEffect(() => {
    fetchRepositories();
  }, []);

  // Fetch repositories
  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRepositoriesUseCase.execute();
      setRepositories(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch repositories');
      console.error('Error fetching repositories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Set current repository
  const selectRepository = async (path) => {
    try {
      setLoading(true);
      setError(null);
      const repo = await setCurrentRepositoryUseCase.execute(path);
      setCurrentRepository(repo);
      
      // Fetch branches for the selected repository
      if (repo && repo.id) {
        const branchData = await getBranchesUseCase.execute(repo.id);
        setBranches(branchData);
      }
    } catch (err) {
      setError(err.message || 'Failed to set repository');
      console.error('Error setting repository:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get diff between branches
  const getDiff = async (fromBranch, toBranch) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentRepository) {
        throw new Error('No repository selected');
      }
      
      return await getDiffUseCase.execute(
        currentRepository.id,
        fromBranch,
        toBranch
      );
    } catch (err) {
      setError(err.message || 'Failed to get diff');
      console.error('Error getting diff:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Analyze diff between branches
  const analyzeDiff = async (fromBranch, toBranch) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentRepository) {
        throw new Error('No repository selected');
      }
      
      return await analyzeDiffUseCase.execute(
        currentRepository.id,
        fromBranch,
        toBranch
      );
    } catch (err) {
      setError(err.message || 'Failed to analyze diff');
      console.error('Error analyzing diff:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    // State
    repositories,
    currentRepository,
    branches,
    loading,
    error,
    
    // Actions
    fetchRepositories,
    selectRepository,
    getDiff,
    analyzeDiff,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 