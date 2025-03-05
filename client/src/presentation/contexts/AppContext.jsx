import React, { createContext, useContext } from 'react';
import { useBranchSelection } from '../hooks/useBranches';

// Create context
const AppContext = createContext();

/**
 * App context provider
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Provider component
 */
export const AppProvider = ({ children }) => {
  // Use the branch selection hook for managing branch state
  const branchSelection = useBranchSelection();
  
  // Context value
  const value = {
    ...branchSelection
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook for using app context
 * @returns {Object} - App context
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}; 