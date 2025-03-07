import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../../App';
import themeReducer from '../../store/themeSlice';

// Set up MSW handlers
const handlers = [
  rest.get('/api/git/repositories', (req, res, ctx) => {
  return res(ctx.json([
  { id: 1, name: 'Test Repo', path: '/test/repo' }
  ]));
  }),

  rest.post('/api/git/repository/set', (req, res, ctx) => {
  const path = req.body;
  return res(ctx.json({
  name: 'Test Repo',
  path: path,
  branches: ['main', 'develop', 'feature/test'],
  current: 'main'
  }));
  }),

  rest.get('/api/git/repository/branches', (req, res, ctx) => {
  return res(ctx.json([
  'main',
  'develop',
  'feature/test'
  ]));
  }),

  rest.get('/api/git/diff', (req, res, ctx) => {
  const fromBranch = req.url.searchParams.get('from');
  const toBranch = req.url.searchParams.get('to');

  return res(ctx.json({
  diff: 'test diff content',
  fromBranch,
  toBranch,
  repository: '/test/repo'
  }));
  })
];

// Set up MSW server
const server = setupServer(...handlers);

// Set up server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe('App Integration', () => {
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
  });

  const renderApp = () => {
  return render(
  <Provider store={ store }>
  <QueryClientProvider client={ queryClient }>
    <App />
  </QueryClientProvider>
  </Provider>
  );
  };

  it('should render the app', () => {
  renderApp();
  expect(screen.getByText(/Local Rabbit/i)).toBeInTheDocument();
  });

  it('should load repositories', async () => {
  renderApp();
  await waitFor(() => {
  expect(screen.getByText('Test Repo')).toBeInTheDocument();
  });
  });

  it('should handle repository selection', async () => {
  renderApp();
  await waitFor(() => {
  expect(screen.getByText('Test Repo')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Test Repo'));
  await waitFor(() => {
  expect(screen.getByText('main')).toBeInTheDocument();
  expect(screen.getByText('develop')).toBeInTheDocument();
  expect(screen.getByText('feature/test')).toBeInTheDocument();
  });
  });

  it('should handle branch selection and show diff', async () => {
  renderApp();
  await waitFor(() => {
  expect(screen.getByText('Test Repo')).toBeInTheDocument();
  });

  // Select repository
  fireEvent.click(screen.getByText('Test Repo'));
  await waitFor(() => {
  expect(screen.getByText('main')).toBeInTheDocument();
  });

  // Select branches
  fireEvent.click(screen.getByText('main'));
  fireEvent.click(screen.getByText('develop'));

  // Wait for diff to load
  await waitFor(() => {
  expect(screen.getByText('test diff content')).toBeInTheDocument();
  });
  });
});

