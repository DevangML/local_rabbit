import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DiffViewer from '../../presentation/components/diff/DiffViewer';
import themeReducer from '../../store/themeSlice';
import { cacheInstance, CACHE_TYPES } from '../../utils/cache';

// Mock the cache instance
vi.mock('../../utils/cache', () => ({
  cacheInstance: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    getOrFetch: vi.fn()
  },
  CACHE_TYPES: {
    DIFF: 'diff'
  }
}));

// Mock the child components
vi.mock('../../components/CommentsPanel', () => ({
  default: () => <div data-testid="comments-panel">Comments Panel</div>
}));

vi.mock('../../components/DiffSearch', () => ({
  default: ({ onSearch }) => (
    <div data-testid="diff-search">
      <button onClick={() => onSearch({ query: 'test', filters: {} })}>Search</button>
    </div>
  )
}));

vi.mock('../../components/RecoveryOptions', () => ({
  default: ({ onRetry }) => (
    <div data-testid="recovery-options">
      <button onClick={onRetry}>Retry</button>
    </div>
  )
}));

// Mock fetch API
global.fetch = vi.fn();

describe('DiffViewer', () => {
  let store;
  let queryClient;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        theme: themeReducer
      }
    });
    queryClient = new QueryClient();
  });

  const renderWithProviders = (component) => {
    return render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {component}
        </QueryClientProvider>
      </Provider>
    );
  };

  it('should render empty state', () => {
    renderWithProviders(<DiffViewer fromBranch="" toBranch="" />);
    expect(screen.getByText(/select both branches/i)).toBeInTheDocument();
  });

  it('should render diff content', () => {
    renderWithProviders(<DiffViewer fromBranch="main" toBranch="develop" />);
    expect(screen.getByText(/main → develop/i)).toBeInTheDocument();
  });

  it('should handle tab switching', () => {
    renderWithProviders(<DiffViewer fromBranch="main" toBranch="develop" />);
    fireEvent.click(screen.getByText('Statistics'));
    expect(screen.getByText(/files changed/i)).toBeInTheDocument();
  });

  it('should handle refresh', async () => {
    renderWithProviders(<DiffViewer fromBranch="main" toBranch="develop" />);
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    expect(await screen.findByText(/loading diff/i)).toBeInTheDocument();
  });
});

describe('DiffViewer Component', () => {
  const mockDiffData = {
    files: [
      {
        path: 'src/components/App.jsx',
        additions: 10,
        deletions: 5,
        changes: [
          { type: 'added', content: '+import React from "react";', lineNumber: 1 },
          { type: 'context', content: ' import { useState } from "react";', lineNumber: 2 },
          { type: 'deleted', content: '-const App = () => {', lineNumber: 3 },
          { type: 'added', content: '+const App = (props) => {', lineNumber: 4 }
        ]
      },
      {
        path: 'src/utils/helpers.js',
        additions: 3,
        deletions: 1,
        changes: [
          { type: 'context', content: ' export const formatDate = (date) => {', lineNumber: 1 },
          { type: 'added', content: '+  return new Date(date).toLocaleDateString();', lineNumber: 2 }
        ]
      }
    ],
    summary: {
      totalFiles: 2,
      totalAdditions: 13,
      totalDeletions: 6
    }
  };

  const mockStore = configureStore({
    reducer: {
      theme: (state = { isDark: false }, action) => {
        if (action.type === 'theme/toggleTheme') {
          return { ...state, isDark: !state.isDark };
        }
        return state;
      }
    }
  });

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
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={mockStore}>
        <DiffViewer
          fromBranch="main"
          toBranch="feature"
          {...props}
        />
      </Provider>
    );
  };

  it('renders loading state initially', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDiffData
    });

    renderComponent();

    expect(screen.getByText(/Loading diff/i)).toBeInTheDocument();
  });

  it('renders error when branches are not provided', async () => {
    renderComponent({ fromBranch: '', toBranch: '' });

    await waitFor(() => {
      expect(screen.getByText(/Both 'from' and 'to' branches must be selected/i)).toBeInTheDocument();
    });
  });

  it('renders diff data when provided as props', async () => {
    renderComponent({ diffData: mockDiffData });

    await waitFor(() => {
      expect(screen.getByText(/src\/components\/App.jsx/i)).toBeInTheDocument();
      expect(screen.getByText(/src\/utils\/helpers.js/i)).toBeInTheDocument();
    });
  });

  it('fetches diff data when not provided as props', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDiffData
    });

    renderComponent();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/diff'),
        expect.any(Object)
      );
      expect(screen.getByText(/src\/components\/App.jsx/i)).toBeInTheDocument();
    });
  });

  it('handles fetch error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Error loading diff/i)).toBeInTheDocument();
      expect(screen.getByTestId('recovery-options')).toBeInTheDocument();
    });
  });

  it('toggles file expansion when clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDiffData
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/src\/components\/App.jsx/i)).toBeInTheDocument();
    });

    // Initially files should be collapsed
    expect(screen.queryByText(/import React from "react"/i)).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText(/src\/components\/App.jsx/i));

    // Now file content should be visible
    expect(screen.getByText(/import React from "react"/i)).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(screen.getByText(/src\/components\/App.jsx/i));

    // Content should be hidden again
    expect(screen.queryByText(/import React from "react"/i)).not.toBeInTheDocument();
  });

  it('switches between unified and split view modes', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDiffData
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/src\/components\/App.jsx/i)).toBeInTheDocument();
    });

    // Should start in unified view
    expect(screen.getByLabelText(/Split View/i)).toBeInTheDocument();

    // Switch to split view
    fireEvent.click(screen.getByLabelText(/Split View/i));

    // Now should show unified view option
    expect(screen.getByLabelText(/Unified View/i)).toBeInTheDocument();
  });

  it('uses cached data when available', async () => {
    // Mock localStorage to return cached data
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockDiffData));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/src\/components\/App.jsx/i)).toBeInTheDocument();
      // Fetch should not be called when cache is used
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  it('handles search functionality', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDiffData
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('diff-search')).toBeInTheDocument();
    });

    // Trigger search
    fireEvent.click(screen.getByText('Search'));

    // This would typically filter the diff view, but since we're mocking the component,
    // we just verify the search component is rendered and clickable
    expect(screen.getByTestId('diff-search')).toBeInTheDocument();
  });

  it('retries loading on error', async () => {
    // First request fails
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    // Second request succeeds
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockDiffData
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('recovery-options')).toBeInTheDocument();
    });

    // Click retry button
    fireEvent.click(screen.getByText('Retry'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/src\/components\/App.jsx/i)).toBeInTheDocument();
    });
  });
});
