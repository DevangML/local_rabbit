import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranches } from '../../hooks/useBranches';
import { useAppContext } from '../../contexts/AppContext';
import { useCurrentRepository } from '../../hooks/useRepositories';

/**
 * Branch selector component
 * @returns { JSX.Element } - Component
 */
const BranchSelector = () => {
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const { data: branches, isLoading, error } = useBranches();
  const { data: currentRepository } = useCurrentRepository();
  const { fromBranch, toBranch, setFromBranch, setToBranch, swapBranches } = useAppContext();

  const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
  opacity: 1, 
  y: 0,
  transition: { 
  duration: 0.5,
  staggerChildren: 0.1
  }
  }
  };

  const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
  };

  const dropdownVariants = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' },
  visible: { 
  opacity: 1, 
  height: 'auto',
  transition: { 
  duration: 0.3,
  staggerChildren: 0.05
  }
  }
  };

  /**
   * Toggle from branch dropdown
   */
  const toggleFromDropdown = () => {
  setIsFromOpen(!isFromOpen);
  if (isToOpen) { setIsToOpen(false); }
  };

  /**
   * Toggle to branch dropdown
   */
  const toggleToDropdown = () => {
  setIsToOpen(!isToOpen);
  if (isFromOpen) { setIsFromOpen(false); }
  };

  /**
   * Handle from branch selection
   * @param { string } branch - Branch name
   */
  const handleSelectFromBranch = (branch) => {
  setFromBranch(branch);
  setIsFromOpen(false);
  };

  /**
   * Handle to branch selection
   * @param { string } branch - Branch name
   */
  const handleSelectToBranch = (branch) => {
  setToBranch(branch);
  setIsToOpen(false);
  };

  if (!currentRepository) {
  return (
  <motion.div 
  className='branch-selector empty'
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
  >
  <p>Please select a repository first</p>
  </motion.div>
  );
  }

  return (
  <motion.div 
  className='branch-selector'
  variants={ containerVariants }
  initial='hidden'
  animate='visible'
  >
  <motion.h3 variants={ itemVariants }>Compare Branches</motion.h3>
  
  { /* Branch selectors */ }
  <motion.div 
  className='branch-selectors'
  variants={ itemVariants }
  >
  { /* From branch selector */ }
  <div className='branch-selector-group'>
    <label>From:</label>
    <motion.div 
    className='branch-dropdown-trigger'
    onClick={ toggleFromDropdown }
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    >
    <span className='current-value'>
    { fromBranch || 'Select branch' }
    </span>
    <motion.span 
    className='dropdown-arrow'
    animate={{ rotate: isFromOpen ? 180 : 0 }}
    transition={{ duration: 0.3 }}
    >
    ▼
    </motion.span>
    </motion.div>
    
    { /* From branch dropdown */ }
    <AnimatePresence>
    { isFromOpen && (
    <motion.div 
    className='branch-dropdown'
    variants={ dropdownVariants }
    initial='hidden'
    animate='visible'
    exit='hidden'
    >
    { isLoading && (
      <motion.div 
      className='loading-indicator'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      >
      <motion.div 
      className='loading-spinner'
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      ></motion.div>
      <span>Loading branches...</span>
      </motion.div>
    ) }
    
    { error && (
      <motion.div 
      className='error-message'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      >
      <p>Error: { error.message }</p>
      </motion.div>
    ) }
    
    { branches && branches.length > 0 && (
      <motion.ul className='branch-list'>
      { branches.map((branch) => (
      <motion.li 
      key={ branch.name }
      variants={ itemVariants }
      whileHover={{ 
        scale: 1.02, 
        backgroundColor: 'var(--color-hover-bg)',
        x: 5
      }}
      whileTap={{ scale: 0.98 }}
      onClick={ () => handleSelectFromBranch(branch.name) }
      className={ fromBranch === branch.name ? 'selected' : '' }
      >
      { branch.name }
      { fromBranch === branch.name && (
        <motion.span 
        className='selected-indicator'
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500 }}
        >
        ✓
        </motion.span>
      ) }
      </motion.li>
      )) }
      </motion.ul>
    ) }
    
    { branches && branches.length === 0 && (
      <motion.div 
      className='empty-message'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      >
      <p>No branches found</p>
      </motion.div>
    ) }
    </motion.div>
    ) }
    </AnimatePresence>
  </div>
  
  { /* Swap button */ }
  <motion.button 
    className='swap-button'
    onClick={ swapBranches }
    disabled={ !fromBranch || !toBranch }
    whileHover={{ scale: 1.1, rotate: 180 }}
    whileTap={{ scale: 0.9 }}
    transition={{ duration: 0.3 }}
  >
    ⇄
  </motion.button>
  
  { /* To branch selector */ }
  <div className='branch-selector-group'>
    <label>To:</label>
    <motion.div 
    className='branch-dropdown-trigger'
    onClick={ toggleToDropdown }
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    >
    <span className='current-value'>
    { toBranch || 'Select branch' }
    </span>
    <motion.span 
    className='dropdown-arrow'
    animate={{ rotate: isToOpen ? 180 : 0 }}
    transition={{ duration: 0.3 }}
    >
    ▼
    </motion.span>
    </motion.div>
    
    { /* To branch dropdown */ }
    <AnimatePresence>
    { isToOpen && (
    <motion.div 
    className='branch-dropdown'
    variants={ dropdownVariants }
    initial='hidden'
    animate='visible'
    exit='hidden'
    >
    { isLoading && (
      <motion.div 
      className='loading-indicator'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      >
      <motion.div 
      className='loading-spinner'
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      ></motion.div>
      <span>Loading branches...</span>
      </motion.div>
    ) }
    
    { error && (
      <motion.div 
      className='error-message'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      >
      <p>Error: { error.message }</p>
      </motion.div>
    ) }
    
    { branches && branches.length > 0 && (
      <motion.ul className='branch-list'>
      { branches.map((branch) => (
      <motion.li 
      key={ branch.name }
      variants={ itemVariants }
      whileHover={{ 
        scale: 1.02, 
        backgroundColor: 'var(--color-hover-bg)',
        x: 5
      }}
      whileTap={{ scale: 0.98 }}
      onClick={ () => handleSelectToBranch(branch.name) }
      className={ toBranch === branch.name ? 'selected' : '' }
      >
      { branch.name }
      { toBranch === branch.name && (
        <motion.span 
        className='selected-indicator'
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500 }}
        >
        ✓
        </motion.span>
      ) }
      </motion.li>
      )) }
      </motion.ul>
    ) }
    
    { branches && branches.length === 0 && (
      <motion.div 
      className='empty-message'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      >
      <p>No branches found</p>
      </motion.div>
    ) }
    </motion.div>
    ) }
    </AnimatePresence>
  </div>
  </motion.div>
  
  { /* Selected branches info */ }
  <AnimatePresence>
  { fromBranch && toBranch && (
    <motion.div 
    className='selected-branches-info'
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.3 }}
    >
    <p>Comparing changes from <strong>{ fromBranch }</strong> to <strong>{ toBranch }</strong></p>
    </motion.div>
  ) }
  </AnimatePresence>
  </motion.div>
  );
};

export default BranchSelector; 