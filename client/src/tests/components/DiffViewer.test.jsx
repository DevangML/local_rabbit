import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DiffViewer from '../../presentation/components/diff/DiffViewer';
import themeReducer from '../../store/themeSlice';

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
