import React, { useState, useCallback } from 'react';
import { stateManager } from '../services/StateManager';

const RecoveryOptions = ({ onRecover }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      const state = await stateManager.exportState();
      if (!state) {throw new Error('Failed to export state');}

      // Create and download state file
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `localCodeRabbit-state-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export state: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = useCallback(async (event) => {
    try {
      setIsImporting(true);
      setError(null);
      const file = event.target.files[0];
      if (!file) {return;}

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const state = JSON.parse(e.target.result);
          const success = await stateManager.importState(state);
          if (!success) {throw new Error('Failed to import state');}
          if (onRecover) {onRecover();}
        } catch (err) {
          setError('Failed to import state: ' + err.message);
        } finally {
          setIsImporting(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Failed to read file: ' + err.message);
      setIsImporting(false);
    }
  }, [onRecover]);

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all state? This cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      const success = await stateManager.resetAllState();
      if (!success) {throw new Error('Failed to reset state');}
      if (onRecover) {onRecover();}
    } catch (err) {
      setError('Failed to reset state: ' + err.message);
    }
  };

  return (
    <div className="recovery-options">
      <div className="recovery-header">
        <h3>Recovery Options</h3>
        <p>Export, import, or reset application state</p>
      </div>

      {error && (
        <div className="recovery-error">
          {error}
        </div>
      )}

      <div className="recovery-actions">
        <button
          className="recovery-button"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export State'}
        </button>

        <label className="recovery-button import-button">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={isImporting}
            style={{ display: 'none' }}
          />
          {isImporting ? 'Importing...' : 'Import State'}
        </label>

        <button
          className="recovery-button danger"
          onClick={handleReset}
        >
          Reset All State
        </button>
      </div>

      <div className="recovery-info">
        <p>
          <strong>Note:</strong> Exporting state creates a backup file of your current settings and data.
          You can import this file later to restore your state if something goes wrong.
        </p>
      </div>
    </div>
  );
};

export default RecoveryOptions; 