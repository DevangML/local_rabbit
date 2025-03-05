import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProjectSelector from '../../components/ProjectSelector';
import { cacheInstance } from '../../utils/cache';

// Mock the Redux store
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

// Mock the cache instance
vi.mock('../../utils/cache', () => ({
  cacheInstance: {
    clear: vi.fn()
  }
}));

// Mock fetch API
global.fetch = vi.fn();

describe('ProjectSelector Component', () => {
  const mockOnProjectSelect = vi.fn();
  const mockOnBranchesChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset fetch mock
    fetch.mockReset();

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={mockStore}>
        <ProjectSelector
          onProjectSelect={mockOnProjectSelect}
          onBranchesChange={mockOnBranchesChange}
          selectedBranches={{}}
          isLoading={false}
          {...props}
        />
      </Provider>
    );
  };

  it('renders correctly with default props', () => {
    renderComponent();

    expect(screen.getByText('Repository Selection')).toBeInTheDocument();
    expect(screen.getByLabelText(/Repository Path:/i)).toBeInTheDocument();
    expect(screen.getByText(/Set Repository/i)).toBeInTheDocument();
  });

  it('shows error when submitting empty path', async () => {
    renderComponent();

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(screen.getByText('Please enter a folder path')).toBeInTheDocument();
    expect(mockOnProjectSelect).not.toHaveBeenCalled();
  });

  it('handles successful repository selection', async () => {
    const mockRepoData = {
      name: 'test-repo',
      path: '/path/to/repo',
      branches: ['main', 'develop']
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepoData
    });

    renderComponent();

    const input = screen.getByLabelText(/Repository Path:/i);
    fireEvent.change(input, { target: { value: '/path/to/repo' } });

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/repository/set', expect.any(Object));
      expect(mockOnProjectSelect).toHaveBeenCalledWith(mockRepoData);
      expect(cacheInstance.clear).toHaveBeenCalled();
    });
  });

  it('handles repository selection error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => 'Repository not found'
    });

    renderComponent();

    const input = screen.getByLabelText(/Repository Path:/i);
    fireEvent.change(input, { target: { value: '/invalid/path' } });

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Failed to select repository/i)).toBeInTheDocument();
      expect(mockOnProjectSelect).not.toHaveBeenCalled();
    });
  });

  it('loads recent repositories from localStorage', async () => {
    const mockRecentRepos = [
      { name: 'repo1', path: '/path/to/repo1' },
      { name: 'repo2', path: '/path/to/repo2' }
    ];

    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockRecentRepos));

    renderComponent();

    await waitFor(() => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith('recentRepositories');
      expect(screen.getByText('Recent Repositories')).toBeInTheDocument();
      expect(screen.getByText('repo1')).toBeInTheDocument();
      expect(screen.getByText('repo2')).toBeInTheDocument();
    });
  });

  it('handles recent repository selection', async () => {
    const mockRecentRepos = [
      { name: 'repo1', path: '/path/to/repo1' }
    ];

    const mockRepoData = {
      name: 'repo1',
      path: '/path/to/repo1',
      branches: ['main']
    };

    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockRecentRepos));

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepoData
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('repo1')).toBeInTheDocument();
    });

    const recentRepoButton = screen.getByText('repo1');
    fireEvent.click(recentRepoButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/repository/set', expect.any(Object));
      expect(mockOnProjectSelect).toHaveBeenCalledWith(mockRepoData);
    });
  });

  it('fetches branches when repository is selected', async () => {
    const mockRepoData = {
      name: 'test-repo',
      path: '/path/to/repo',
      branches: []
    };

    const mockBranchesData = {
      branches: ['main', 'develop', 'feature/test']
    };

    // Mock first fetch for repository selection
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepoData
    });

    // Mock second fetch for branches
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBranchesData
    });

    renderComponent();

    const input = screen.getByLabelText(/Repository Path:/i);
    fireEvent.change(input, { target: { value: '/path/to/repo' } });

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}/api/repo/branches`, expect.any(Object));
    });
  });

  it('handles branches fetch error', async () => {
    const mockRepoData = {
      name: 'test-repo',
      path: '/path/to/repo',
      branches: []
    };

    // Mock first fetch for repository selection
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepoData
    });

    // Mock second fetch for branches (error)
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Server error'
    });

    renderComponent();

    const input = screen.getByLabelText(/Repository Path:/i);
    fireEvent.change(input, { target: { value: '/path/to/repo' } });

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load branches/i)).toBeInTheDocument();
    });
  });

  it('disables inputs when loading', () => {
    renderComponent({ isLoading: true });

    expect(screen.getByLabelText(/Repository Path:/i)).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('adds repository to recent repositories list', async () => {
    const mockRepoData = {
      name: 'new-repo',
      path: '/path/to/new-repo',
      branches: ['main']
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRepoData
    });

    renderComponent();

    const input = screen.getByLabelText(/Repository Path:/i);
    fireEvent.change(input, { target: { value: '/path/to/new-repo' } });

    const form = screen.getByRole('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'recentRepositories',
        expect.any(String)
      );
    });
  });
}); 