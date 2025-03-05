import React, { createContext, useContext, useState, useEffect } from 'react';
import container from '../../infrastructure/di/container';
import config from '../../core/application/config';

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
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [isAiEnabled] = useState(config.ENABLE_AI_FEATURES && !!config.GEMINI_API_KEY);

  // Use cases
  const getRepositoriesUseCase = container.resolve('getRepositoriesUseCase');
  const setCurrentRepositoryUseCase = container.resolve('setCurrentRepositoryUseCase');
  const getBranchesUseCase = container.resolve('getBranchesUseCase');
  const getDiffUseCase = container.resolve('getDiffUseCase');
  const analyzeDiffUseCase = container.resolve('analyzeDiffUseCase');
  const analyzeDiffWithAIUseCase = container.resolve('analyzeDiffWithAIUseCase');

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

  // Analyze diff with AI
  const analyzeDiffWithAI = async (fromBranch, toBranch, prompt) => {
    if (!isAiEnabled) {
      setAiError('AI features are disabled or API key is missing');
      return null;
    }

    try {
      setLoading(true);
      setAiError(null);
      
      if (!currentRepository) {
        throw new Error('No repository selected');
      }
      
      const result = await analyzeDiffWithAIUseCase.execute(
        currentRepository.id,
        fromBranch,
        toBranch,
        prompt
      );
      
      setAiAnalysis(result.analysis);
      return result.analysis;
    } catch (err) {
      setAiError(err.message || 'Failed to analyze diff with AI');
      console.error('Error analyzing diff with AI:', err);
      
      // If we have a partial result, still return it
      if (err.partial) {
        setAiAnalysis(err);
        return err;
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear AI analysis
  const clearAiAnalysis = () => {
    setAiAnalysis(null);
    setAiError(null);
  };

  // Context value
  const value = {
    // State
    repositories,
    currentRepository,
    branches,
    loading,
    error,
    aiAnalysis,
    aiError,
    isAiEnabled,
    
    // Actions
    fetchRepositories,
    selectRepository,
    getDiff,
    analyzeDiff,
    analyzeDiffWithAI,
    clearAiAnalysis,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 