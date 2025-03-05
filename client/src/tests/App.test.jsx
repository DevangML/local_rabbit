import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import App from '../App';
import themeReducer from '../store/themeSlice';
import { DiffApiService } from './mocks/DiffApiService';

// Set up MSW handlers
const handlers = [
  http.get('/api/git/repositories', () => {
    return HttpResponse.json([
      { id: 1, name: 'Test Repo', path: '/test/repo' }
    ]);
  }),

  http.post('/api/git/repository/set', () => {
    return HttpResponse.json({
      name: 'Test Repo',
      path: '/test/repo',
      branches: ['main', 'develop', 'feature/test'],
      current: 'main'
    });
  }),

  http.get('/api/git/repository/branches', () => {
    return HttpResponse.json([
      'main',
      'develop',
      'feature/test'
    ]);
  }),

  http.get('/api/git/diff', ({ request }) => {
    const url = new URL(request.url);
    const fromBranch = url.searchParams.get('from');
    const toBranch = url.searchParams.get('to');

    return HttpResponse.json({
      diff: 'test diff content',
      fromBranch,
      toBranch,
      repository: '/test/repo'
    });
  })
];

// Set up MSW server
const server = setupServer(...handlers);

// Set up server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

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
      Diff Viewer: {fromBranch} → {toBranch}
    </div>
  )
}));

vi.mock('../infrastructure/api/services/DiffApiService', () => ({
  DiffApiService: vi.fn().mockImplementation(() => new DiffApiService())
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
  let store;
  let queryClient;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        theme: themeReducer
      }
    });

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    });

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
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </Provider>
    );
  };

  it('renders without crashing', () => {
    renderApp();
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
  });

  it('renders the app header and navigation', () => {
    renderApp();

    expect(screen.getByText('Local Rabbit')).toBeInTheDocument();
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
    const selectProjectBtn = screen.getByTestId('select-project-btn');
    fireEvent.click(selectProjectBtn);

    await waitFor(() => {
      expect(screen.getByText(/Test Repo/)).toBeInTheDocument();
    });
  });

  it('handles branch selection', async () => {
    renderApp();
    const selectBranchesBtn = screen.getByTestId('select-branches-btn');
    fireEvent.click(selectBranchesBtn);

    await waitFor(() => {
      expect(screen.getByText(/main → feature/)).toBeInTheDocument();
    });
  });

  it('shows diff viewer when branches are selected', async () => {
    renderApp();
    const selectProjectBtn = screen.getByTestId('select-project-btn');
    const selectBranchesBtn = screen.getByTestId('select-branches-btn');

    fireEvent.click(selectProjectBtn);
    fireEvent.click(selectBranchesBtn);

    await waitFor(() => {
      expect(screen.getByTestId('diff-viewer')).toBeInTheDocument();
      expect(screen.getByText(/main → feature/)).toBeInTheDocument();
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
    // Set up mobile viewport
    const originalInnerWidth = window.innerWidth;
    window.innerWidth = 500;
    window.dispatchEvent(new Event('resize'));

    renderApp();

    // Get elements
    const menuButton = screen.getByRole('button', { name: /Toggle navigation menu/i });
    const menu = screen.getByRole('navigation').querySelector('.nav-links');

    // Initially menu should not have mobile-open class
    expect(menu).not.toHaveClass('mobile-open');

    // Open menu
    await act(async () => {
      fireEvent.click(menuButton);
    });

    // Menu should have mobile-open class
    expect(menu).toHaveClass('mobile-open');

    // Close menu
    await act(async () => {
      fireEvent.click(menuButton);
    });

    // Menu should not have mobile-open class
    expect(menu).not.toHaveClass('mobile-open');

    // Clean up
    window.innerWidth = originalInnerWidth;
    window.dispatchEvent(new Event('resize'));
  });

  it('renders loading indicator when loading', async () => {
    renderApp();

    // Mock loading state
    server.use(
      http.post('/api/git/repository/set', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({
          name: 'Test Repo',
          path: '/test/repo',
          branches: ['main', 'develop', 'feature/test'],
          current: 'main'
        });
      })
    );

    // Select a project (which will trigger loading state)
    fireEvent.click(screen.getByTestId('select-project-btn'));

    // Should show loading indicator
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });
});
