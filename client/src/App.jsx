import React from 'react';
import { AppProvider } from './presentation/contexts/AppContext';
import DiffPage from './presentation/pages/DiffPage';
import './App.css';

/**
 * Main application component
 * @returns {JSX.Element} - Component
 */
function App() {
  return (
    <AppProvider>
      <DiffPage />
    </AppProvider>
  );
}

export default App;
