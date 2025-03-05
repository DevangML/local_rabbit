import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Hero from './components/Hero/Hero';
import DiffViewerContainer from './components/DiffViewer/DiffViewerContainer';
import AIAnalyzer from './components/AIAnalyzer/AIAnalyzer';
import ImpactView from './components/ImpactView/ImpactView';
import QualityCheck from './components/QualityCheck/QualityCheck';
import lunarTheme from './theme/lunarTheme';

const App = () => {
  const [repoPath, setRepoPath] = useState('');
  const [fromBranch, setFromBranch] = useState('');
  const [toBranch, setToBranch] = useState('');
  const [branches, setBranches] = useState([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  const handleRepoPathChange = async (path) => {
    setRepoPath(path);
    setFromBranch('');
    setToBranch('');

    if (!path) {
      setBranches([]);
      return;
    }

    setIsLoadingBranches(true);
    try {
      const response = await fetch('/api/git/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }

      const data = await response.json();
      setBranches(data.branches || []);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setBranches([]);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const commonProps = {
    fromBranch,
    toBranch,
    branches,
    onFromBranchChange: setFromBranch,
    onToBranchChange: setToBranch,
    isLoadingBranches,
  };

  return (
    <Router>
      <ThemeProvider theme={lunarTheme}>
        <CssBaseline />
        <MainLayout onRepoPathChange={handleRepoPathChange}>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route
              path="/diff"
              element={
                <DiffViewerContainer
                  {...commonProps}
                  repoPath={repoPath}
                />
              }
            />
            <Route
              path="/analyze"
              element={
                <AIAnalyzer
                  {...commonProps}
                  repoPath={repoPath}
                />
              }
            />
            <Route
              path="/impact"
              element={
                <ImpactView
                  {...commonProps}
                  repoPath={repoPath}
                />
              }
            />
            <Route
              path="/quality"
              element={
                <QualityCheck
                  {...commonProps}
                  repoPath={repoPath}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </ThemeProvider>
    </Router>
  );
};

export default App;