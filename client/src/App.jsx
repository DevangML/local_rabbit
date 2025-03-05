import React from 'react';
import { AppProvider } from './presentation/contexts/AppContext';
import { ToastProvider } from './presentation/contexts/ToastContext';
import DiffPage from './presentation/pages/DiffPage';
import './App.css';

/**
 * Main application component
 * @returns {JSX.Element} - Component
 */
function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <DiffPage />
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
