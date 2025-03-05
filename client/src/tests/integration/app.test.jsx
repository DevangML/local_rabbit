import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../../App';
import themeReducer from '../../store/themeSlice';

const server = setupServer(
  rest.get('/api/repositories', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Test Repo', path: '/test/repo' }
    ]));
  }),

  rest.get('/api/branches', (req, res, ctx) => {
    return res(ctx.json([
      'main',
      'develop',
      'feature/test'
    ]));
  }),

  rest.get('/api/diff', (req, res, ctx) => {
    return res(ctx.json({
      files: [
        {
          path: 'test.js',
          changes: [
            { type: 'add', content: 'new line', lineNumber: 1 }
          ]
        }
      ]
    }));
  })
);

describe('App Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderWithRedux = () => {
    const store = configureStore({
      reducer: {
        theme: themeReducer
      }
    });

    return render(
      <Provider store={store}>
        <App />
      </Provider>
    );
  };

  it('should handle repository selection and branch comparison', async () => {
    renderWithRedux();

    // Wait for repositories to load
    await waitFor(() => {
      expect(screen.getByText('Test Repo')).toBeInTheDocument();
    });

    // Select repository
    fireEvent.click(screen.getByText('Test Repo'));

    // Wait for branches to load
    await waitFor(() => {
      expect(screen.getByText('main')).toBeInTheDocument();
      expect(screen.getByText('develop')).toBeInTheDocument();
    });

    // Select branches
    fireEvent.click(screen.getByText('main'));
    fireEvent.click(screen.getByText('develop'));

    // Wait for diff to load
    await waitFor(() => {
      expect(screen.getByText('test.js')).toBeInTheDocument();
    });
  });

  it('should handle theme switching', async () => {
    renderWithRedux();

    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    expect(themeToggle).toBeInTheDocument();

    // Toggle theme
    fireEvent.click(themeToggle);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
