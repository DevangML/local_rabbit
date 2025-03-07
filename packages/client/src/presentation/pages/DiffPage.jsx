import React, { useState } from 'react';
import RepositorySelector from '../components/repository/RepositorySelector';
import BranchSelector from '../components/repository/BranchSelector';
import DiffViewer from '../components/diff/DiffViewer';
import DiffAnalyzer from '../components/diff/DiffAnalyzer';
import AIAnalyzer from '../components/ai/AIAnalyzer';
import { useAppContext } from '../contexts/AppContext';

/**
 * Main diff page component
 * @returns { JSX.Element } - Component
 */
const DiffPage = () => {
  const { loading, isAiEnabled } = useAppContext();
  const [fromBranch, setFromBranch] = useState('');
  const [toBranch, setToBranch] = useState('');
  const [activeTab, setActiveTab] = useState('view');

  /**
   * Handle from branch change
   * @param { string } branch - Branch name
   */
  const handleFromBranchChange = (branch) => {
  setFromBranch(branch);
  };

  /**
   * Handle to branch change
   * @param { string } branch - Branch name
   */
  const handleToBranchChange = (branch) => {
  setToBranch(branch);
  };

  return (
  <div className='diff-page'>
  <header className='app-header'>
  <h1>Git Diff Analyzer</h1>
  </header>
  
  <main className='app-main'>
  <section className='repository-section'>
    <RepositorySelector />
  </section>
  
  <section className='branch-section'>
    <BranchSelector
    selectedFromBranch={ fromBranch }
    selectedToBranch={ toBranch }
    onFromBranchChange={ handleFromBranchChange }
    onToBranchChange={ handleToBranchChange }
    />
  </section>
  
  { fromBranch && toBranch && (
    <section className='diff-section'>
    { /* Diff tabs */ }
    <div className='diff-section-tabs'>
    <button
    className={ activeTab === 'view' ? 'active' : '' }
    onClick={ () => setActiveTab('view') }
    disabled={ loading }
    >
    View Diff
    </button>
    <button
    className={ activeTab === 'analyze' ? 'active' : '' }
    onClick={ () => setActiveTab('analyze') }
    disabled={ loading }
    >
    Analyze Diff
    </button>
    { isAiEnabled && (
    <button
      className={ activeTab === 'ai' ? 'active' : '' }
      onClick={ () => setActiveTab('ai') }
      disabled={ loading }
    >
      AI Analysis
    </button>
    ) }
    </div>
    
    { /* Diff content */ }
    <div className='diff-section-content'>
    { activeTab === 'view' && (
    <DiffViewer fromBranch={ fromBranch } toBranch={ toBranch } />
    ) }
    
    { activeTab === 'analyze' && (
    <DiffAnalyzer fromBranch={ fromBranch } toBranch={ toBranch } />
    ) }
    
    { activeTab === 'ai' && isAiEnabled && (
    <AIAnalyzer fromBranch={ fromBranch } toBranch={ toBranch } />
    ) }
    </div>
    </section>
  ) }
  </main>
  
  <footer className='app-footer'>
  <p>&copy; { new Date().getFullYear() } Git Diff Analyzer</p>
  </footer>
  </div>
  );
};

export default DiffPage; 