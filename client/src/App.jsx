import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './infrastructure/query/queryClient';
import { AppProvider } from './presentation/contexts/AppContext';
import { ToastProvider } from './presentation/contexts/ToastContext';
import Header from './presentation/components/layout/Header';
import RepositorySelector from './presentation/components/repository/RepositorySelector';
import BranchSelector from './presentation/components/repository/BranchSelector';
import DiffViewer from './presentation/components/diff/DiffViewer';
import DiffAnalyzer from './presentation/components/diff/DiffAnalyzer';
import AIAnalyzer from './presentation/components/ai/AIAnalyzer';
import ToastContainer from './presentation/components/common/ToastContainer';
import './index.css';

/**
 * Main App component
 * @returns {JSX.Element} - App component
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <div className="sidebar">
                <RepositorySelector />
                <BranchSelector />
              </div>
              <div className="content">
                <DiffViewer />
                <div className="analysis-section">
                  <DiffAnalyzer />
                  <AIAnalyzer />
                </div>
              </div>
            </main>
            <ToastContainer />
          </div>
        </AppProvider>
      </ToastProvider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}

export default App;
