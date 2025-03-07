import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
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

// Set up MSW handlers
const handlers = [
  http.get('/api/git/repository/branches', ({ request }) => {
  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  if (path === '/invalid/path') {
  return new HttpResponse(null, { status: 404, statusText: 'Repository not found' });
  }
  return HttpResponse.json(['main', 'develop']);
  }),

  http.post('/api/git/repository/set', async ({ request }) => {
  const data = await request.json();
  if (data.path === '/invalid/path') {
  return new HttpResponse('Repository not found', { status: 404 });
  }
  return HttpResponse.json({
  name: 'test-repo',
  path: data.path,
  branches: ['main', 'develop']
  });
  })
];

const server = setupServer(...handlers);

describe('ProjectSelector Component', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const mockOnProjectSelect = vi.fn();
  const mockOnBranchesChange = vi.fn();

  beforeEach(() => {
  vi.clearAllMocks();

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
  <Provider store={ mockStore }>
  <ProjectSelector
    onProjectSelect={ mockOnProjectSelect }
    onBranchesChange={ mockOnBranchesChange }
    selectedBranches={{}}
    isLoading={ false }
    { ...props }
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
  renderComponent();

  const input = screen.getByLabelText(/Repository Path:/i);
  fireEvent.change(input, { target: { value: '/path/to/repo' } });

  const form = screen.getByRole('form');
  fireEvent.submit(form);

  await waitFor(() => {
  expect(mockOnProjectSelect).toHaveBeenCalledWith(expect.objectContaining({
  name: 'test-repo',
  path: '/path/to/repo',
  branches: ['main', 'develop']
  }));
  expect(cacheInstance.clear).toHaveBeenCalled();
  });
  });

  it('handles repository selection error', async () => {
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

  global.localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockRecentRepos));

  renderComponent();

  await waitFor(() => {
  expect(global.localStorage.getItem).toHaveBeenCalledWith('recentRepositories');
  expect(screen.getByText('Recent Repositories')).toBeInTheDocument();
  expect(screen.getByText('repo1')).toBeInTheDocument();
  expect(screen.getByText('repo2')).toBeInTheDocument();
  });
  });

  it('handles recent repository selection', async () => {
  const mockRecentRepos = [
  { name: 'repo1', path: '/path/to/repo1' }
  ];

  global.localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockRecentRepos));

  renderComponent();

  await waitFor(() => {
  expect(screen.getByText('repo1')).toBeInTheDocument();
  });

  const recentRepoButton = screen.getByText('repo1');
  fireEvent.click(recentRepoButton);

  await waitFor(() => {
  expect(mockOnProjectSelect).toHaveBeenCalledWith(expect.objectContaining({
  name: 'repo1',
  path: '/path/to/repo1',
  branches: ['main', 'develop']
  }));
  });
  });

  it('fetches branches when repository is selected', async () => {
  renderComponent();

  const input = screen.getByLabelText(/Repository Path:/i);
  fireEvent.change(input, { target: { value: '/path/to/repo' } });

  const form = screen.getByRole('form');
  fireEvent.submit(form);

  await waitFor(() => {
  expect(mockOnProjectSelect).toHaveBeenCalledWith(expect.objectContaining({
  name: 'test-repo',
  path: '/path/to/repo',
  branches: ['main', 'develop']
  }));
  });
  });

  it('handles branches fetch error', async () => {
  server.use(
  http.get('/api/git/repository/branches', (req, res, ctx) => {
  return res(ctx.status(500), ctx.text('Server error'));
  })
  );

  renderComponent();

  const input = screen.getByLabelText(/Repository Path:/i);
  fireEvent.change(input, { target: { value: '/path/to/repo' } });

  const form = screen.getByRole('form');
  fireEvent.submit(form);

  await waitFor(() => {
  expect(screen.getByText(/Failed to fetch branches/i)).toBeInTheDocument();
  });
  });
});