import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIDiffAnalysis } from '../../hooks/useDiff';
import { useToast } from '../../contexts/ToastContext';

/**
 * AI Analyzer component for analyzing diffs using AI
 * @param { Object } props - Component props
 * @returns { JSX.Element } - Component
 */
const AIAnalyzer = ({ fromBranch, toBranch }) => {
  const [prompt, setPrompt] = useState('');
  const { 
  data: aiAnalysis, 
  isLoading, 
  error, 
  mutate: analyzeWithAI 
  } = useAIDiffAnalysis();
  
  const { addToast } = useToast();

  const containerVariants = {
  hidden: { opacity: 0, y: 20 },
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
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
  };

  /**
   * Handle analyze button click
   */
  const handleAnalyzeWithAI = () => {
  if (!fromBranch || !toBranch) {
  return;
  }

  analyzeWithAI({ repositoryId: 'current', fromBranch, toBranch, prompt })
  .then(() => {
  addToast('AI analysis completed successfully', 'success');
  })
  .catch((err) => {
  addToast(`Failed to analyze with AI: ${ err.message }`, 'error');
  });
  };

  if (!fromBranch || !toBranch) {
  return (
  <motion.div 
  className='ai-analyzer empty'
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
  >
  <p>Please select both branches to analyze with AI</p>
  </motion.div>
  );
  }

  return (
  <motion.div 
  className='ai-analyzer'
  variants={ containerVariants }
  initial='hidden'
  animate='visible'
  >
  <motion.h2 variants={ itemVariants }>AI Analysis</motion.h2>
  
  { /* Prompt input */ }
  <motion.div 
  className='prompt-container'
  variants={ itemVariants }
  >
  <label htmlFor='ai-prompt'>Custom Instructions (optional):</label>
  <motion.textarea
    id='ai-prompt'
    value={ prompt }
    onChange={ (e) => setPrompt(e.target.value) }
    placeholder='Enter specific instructions for the AI analysis (e.g., 'Focus on security issues' or 'Explain the changes in simple terms')'
    whileFocus={{ scale: 1.01, boxShadow: '0 0 8px rgba(0,123,255,0.5)' }}
  />
  </motion.div>
  
  { /* Analysis button */ }
  <motion.div 
  className='analyzer-actions'
  variants={ itemVariants }
  >
  <motion.button 
    onClick={ handleAnalyzeWithAI } 
    disabled={ isLoading }
    className='analyze-button'
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    { isLoading ? 'AI is analyzing...' : 'Analyze with AI' }
  </motion.button>
  </motion.div>
  
  { /* Error message */ }
  <AnimatePresence>
  { error && (
    <motion.div 
    className='error-message'
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.3 }}
    >
    <p>Error: { error.message }</p>
    </motion.div>
  ) }
  </AnimatePresence>
  
  { /* Loading state */ }
  <AnimatePresence>
  { isLoading && (
    <motion.div 
    className='analyzing-indicator'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    >
    <p>AI is analyzing changes between { fromBranch } and { toBranch }...</p>
    <motion.div 
    className='loading-spinner'
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    ></motion.div>
    <p className='analyzing-note'>This may take a moment as the AI processes the code changes.</p>
    </motion.div>
  ) }
  </AnimatePresence>
  
  { /* AI Analysis results */ }
  <AnimatePresence>
  { aiAnalysis && (
    <motion.div 
    className='ai-analysis-results'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    >
    <motion.h3
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
    >
    AI Analysis Results
    </motion.h3>
    
    { /* Summary */ }
    <motion.div 
    className='ai-analysis-section'
    variants={ itemVariants }
    >
    <h4>Summary</h4>
    <div className='ai-content'>
    { aiAnalysis.summary.split('\n').map((paragraph, idx) => (
      <motion.p 
      key={ idx }
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + idx * 0.1 }}
      >
      { paragraph }
      </motion.p>
    )) }
    </div>
    </motion.div>
    
    { /* Key Changes */ }
    { aiAnalysis.keyChanges && aiAnalysis.keyChanges.length > 0 && (
    <motion.div 
    className='ai-analysis-section'
    variants={ itemVariants }
    >
    <h4>Key Changes</h4>
    <motion.ul 
      className='key-changes-list'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      { aiAnalysis.keyChanges.map((change, index) => (
      <motion.li 
      key={ index }
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.1 }}
      whileHover={{ scale: 1.02, x: 5 }}
      >
      { change }
      </motion.li>
      )) }
    </motion.ul>
    </motion.div>
    ) }
    
    { /* Potential Issues */ }
    { aiAnalysis.potentialIssues && aiAnalysis.potentialIssues.length > 0 && (
    <motion.div 
    className='ai-analysis-section'
    variants={ itemVariants }
    >
    <h4>Potential Issues</h4>
    <motion.ul 
      className='issues-list'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      { aiAnalysis.potentialIssues.map((issue, index) => (
      <motion.li 
      key={ index }
      className='issue-item'
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 + index * 0.1 }}
      whileHover={{ scale: 1.02, x: 5 }}
      >
      { issue }
      </motion.li>
      )) }
    </motion.ul>
    </motion.div>
    ) }
    
    { /* Recommendations */ }
    { aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
    <motion.div 
    className='ai-analysis-section'
    variants={ itemVariants }
    >
    <h4>Recommendations</h4>
    <motion.ul 
      className='recommendations-list'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      { aiAnalysis.recommendations.map((recommendation, index) => (
      <motion.li 
      key={ index }
      className='recommendation-item'
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 + index * 0.1 }}
      whileHover={{ scale: 1.02, x: 5 }}
      >
      { recommendation }
      </motion.li>
      )) }
    </motion.ul>
    </motion.div>
    ) }
    
    { /* Code Quality Assessment */ }
    { aiAnalysis.codeQuality && (
    <motion.div 
    className='ai-analysis-section'
    variants={ itemVariants }
    >
    <h4>Code Quality Assessment</h4>
    <motion.div 
      className='code-quality'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      <div className='quality-score'>
      <span>Overall Score: </span>
      <motion.span 
      className={ `score ${ aiAnalysis.codeQuality.score >= 7 ? 'good' : aiAnalysis.codeQuality.score >= 4 ? 'medium' : 'poor' }` }
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, delay: 0.8 }}
      >
      { aiAnalysis.codeQuality.score }/10
      </motion.span>
      </div>
      <div className='quality-details'>
      { aiAnalysis.codeQuality.details.map((detail, index) => (
      <motion.div 
      key={ index }
      className='quality-detail'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 + index * 0.1 }}
      >
      <span className='detail-category'>{ detail.category }:</span>
      <span className='detail-value'>{ detail.value }</span>
      </motion.div>
      )) }
      </div>
    </motion.div>
    </motion.div>
    ) }
    </motion.div>
  ) }
  </AnimatePresence>
  
  { /* No analysis yet */ }
  <AnimatePresence>
  { !aiAnalysis && !isLoading && (
    <motion.div 
    className='no-analysis'
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    >
    <p>Click the 'Analyze with AI' button to get an AI-powered analysis of the changes between branches.</p>
    <p className='ai-tip'>Tip: You can provide custom instructions to focus the AI analysis on specific aspects.</p>
    </motion.div>
  ) }
  </AnimatePresence>
  </motion.div>
  );
};

export default AIAnalyzer; 