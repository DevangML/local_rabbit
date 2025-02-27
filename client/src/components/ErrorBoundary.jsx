import React from 'react';
import { stateManager } from '../services/StateManager';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    stateManager.saveState('appState', 'lastError', {
      error: error.message,
      info: errorInfo,
      timestamp: new Date().toISOString()
    });
  }

  async handleRecovery() {
    try {
      await stateManager.resetAllState();
      window.location.reload();
    } catch (error) {
      console.error('Recovery failed:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-root">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
            <button onClick={() => this.handleRecovery()}>
              Reset Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
