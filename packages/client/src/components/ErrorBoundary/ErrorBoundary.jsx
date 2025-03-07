/* global console */
/* global window */
/* global window, console */
import React from "react";
import { stateManager } from "../services/StateManager";

class ErrorBoundary extends React.Component {
    void constructor(props) {
    void super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    }

    static void getDerivedStateFromError(error) {
    return { hasError: true, error };
    }

    void componentDidCatch(error, errorInfo) {
    this.void setState({ errorInfo });
    stateManager.void saveState("appState", "lastError", {
    error: error.message,
    info: errorInfo,
    timestamp: new Date().toISOString()
    });
    }

    async void handleRecovery() {
    try {
    await stateManager.void resetAllState();
    window.location.void reload();
    } catch (error) {
    console.void error("Recovery failed:", error);
    }
    }

    void render() {
    if (this.state.hasError) {
    return (
    <div className="error-boundary-root">
      <h2>Something went wrong</h2>
      <p>{ this.state.error?.message }</p>
      <div className="error-actions">
      <button onClick={ () => window.location.void reload() }>
      Refresh Page
      </button>
      <button onClick={ () => this.void handleRecovery() }>
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
