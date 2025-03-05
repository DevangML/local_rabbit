import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import App from '../App';

// Mock the components used in App
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
    Routes: ({ children }) => <div data-testid="routes">{children}</div>,
    Route: ({ path, element }) => <div data-testid={`route-${path}`}>{element}</div>,
    Link: ({ to, children }) => <a data-testid={`link-${to}`} href={to}>{children}</a>,
    useLocation: () => ({ pathname: '/' })
  };
});

vi.mock('../components/ProjectSelector', () => ({
  default: ({ onProjectSelect, onBranchesChange }) => (
    <div data-testid="project-selector">
      <button
        onClick={() => {
          if (typeof onProjectSelect === 'function') {
            onProjectSelect({ name: 'Test Repo', path: '/test/repo' });
          }
        }}
        data-testid="select-project-btn"
      >
        Select Project
      </button>
      <button
        onClick={() => {
          if (typeof onBranchesChange === 'function') {
            onBranchesChange({ from: 'main', to: 'feature' });
          }
        }}
        data-testid="select-branches-btn"
      >
        Select Branches
      </button>
    </div>
  )
}));

vi.mock('../components/DiffViewer', () => ({
  default: ({ fromBranch, toBranch }) => (
    <div data-testid="diff-viewer">
      Diff Viewer: {fromBranch} to {toBranch}
    </div>
  )
}));

vi.mock('../components/ImpactView', () => ({
  default: () => <div data-testid="impact-view">Impact Analysis</div>
}));

vi.mock('../components/QualityView', () => ({
  default: () => <div data-testid="quality-view">Quality Analysis</div>
}));

vi.mock('../components/ReviewPanel', () => ({
  default: () => <div data-testid="review-panel">Review Panel</div>
}));

vi.mock('../components/AIAnalyzer', () => ({
  default: () => <div data-testid="ai-analyzer">AI Analyzer</div>
}));

vi.mock('../components/ThemeToggle', () => ({
  default: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

vi.mock('../components/ThemeSelector', () => ({
  default: () => <div data-testid="theme-selector">Theme Selector</div>
}));

vi.mock('../components/LoadingIndicator', () => ({
  default: () => <div data-testid="loading-indicator">Loading...</div>
}));

vi.mock('../components/ErrorBoundary', () => ({
  default: ({ children }) => <div data-testid="error-boundary">{children}</div>
}));

// Mock fetch API
global.fetch = vi.fn();

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset fetch mock
    fetch.mockReset();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock localStorage initial values
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'localCodeRabbit_repoInfo') {
        return null;
      }
      if (key === 'localCodeRabbit_selectedBranches') {
        return null;
      }
      if (key === 'localCodeRabbit_viewMode') {
        return null;
      }
      return null;
    });
  });

  const renderApp = () => {
    return render(
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    );
  };

  it('renders the app header and navigation', () => {
    renderApp();

    expect(screen.getByText(/Local CodeRabbit/i)).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('theme-selector')).toBeInTheDocument();
  });

  it('renders the project selector', () => {
    renderApp();

    expect(screen.getByTestId('project-selector')).toBeInTheDocument();
    expect(screen.getByTestId('select-project-btn')).toBeInTheDocument();
  });

  it('handles project selection', async () => {
    renderApp();

    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ branches: ['main', 'develop', 'feature'] })
    });

    // Select a project
    fireEvent.click(screen.getByTestId('select-project-btn'));

    await waitFor(() => {
      // Should save to localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'localCodeRabbit_repoInfo',
        expect.any(String)
      );
    });
  });

  it('handles branch selection', async () => {
    renderApp();

    // Select branches
    fireEvent.click(screen.getByTestId('select-branches-btn'));

    await waitFor(() => {
      // Should save to localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'localCodeRabbit_selectedBranches',
        expect.any(String)
      );
    });
  });

  it('loads persisted repository info from localStorage', () => {
    // Mock localStorage to return saved repo info
    const mockRepoInfo = { name: 'Saved Repo', path: '/saved/repo' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'localCodeRabbit_repoInfo') {
        return JSON.stringify(mockRepoInfo);
      }
      return null;
    });

    renderApp();

    // The app should use the persisted repo info
    expect(localStorage.getItem).toHaveBeenCalledWith('localCodeRabbit_repoInfo');
  });

  it('loads persisted branch selection from localStorage', () => {
    // Mock localStorage to return saved branch selection
    const mockBranches = { from: 'saved-main', to: 'saved-feature' };
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'localCodeRabbit_selectedBranches') {
        return JSON.stringify(mockBranches);
      }
      return null;
    });

    renderApp();

    // The app should use the persisted branch selection
    expect(localStorage.getItem).toHaveBeenCalledWith('localCodeRabbit_selectedBranches');
  });

  it('handles API errors gracefully', async () => {
    renderApp();

    // Mock failed API response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Internal Server Error' })
    });

    // Select a project (which will trigger API call)
    fireEvent.click(screen.getByTestId('select-project-btn'));

    await waitFor(() => {
      // Should show error message
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });

  it('toggles mobile menu on small screens', async () => {
    renderApp();

    // Find the mobile menu button
    const menuButton = screen.getByTestId('mobile-menu-button');

    // Initially menu should be closed
    expect(screen.queryByTestId('mobile-menu-open')).not.toBeInTheDocument();

    // Open menu
    act(() => {
      fireEvent.click(menuButton);
    });

    // Menu should be open
    expect(screen.getByTestId('mobile-menu-open')).toBeInTheDocument();

    // Close menu
    act(() => {
      fireEvent.click(menuButton);
    });

    // Wait for state to update
    await waitFor(() => {
      expect(screen.queryByTestId('mobile-menu-open')).not.toBeInTheDocument();
    });
  });

  it('renders loading indicator when loading', async () => {
    renderApp();

    // Mock loading state
    fetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    // Select a project (which will trigger loading state)
    fireEvent.click(screen.getByTestId('select-project-btn'));

    // Should show loading indicator
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });
});
