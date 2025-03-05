import { describe, it, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../../App';

const server = setupServer(
  rest.get('/api/repositories', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Test Repo', path: '/test/repo' }
    ]));
  }),
  // Add more API mocks...
);

describe('App Integration', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('should load repositories and allow branch selection', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Repo')).toBeInTheDocument();
    });

    // Test full workflow...
  });

  // Add more test cases...
});
