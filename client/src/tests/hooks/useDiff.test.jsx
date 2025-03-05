import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDiff, useDiffAnalysis, useAIDiffAnalysis } from '../../presentation/hooks/useDiff';

describe('Diff Hooks', () => {
  let wrapper;

  beforeEach(() => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });

  it('should handle useDiff hook', async () => {
    const { result } = renderHook(() => useDiff('main', 'develop'), { wrapper });
    expect(result.current.isLoading).toBe(true);
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.data).toBeDefined();
  });

  it('should handle useDiffAnalysis hook', async () => {
    const { result } = renderHook(() => useDiffAnalysis('main', 'develop'), { wrapper });
    expect(result.current.isLoading).toBe(false); // Manual trigger only
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.data).toBeDefined();
  });

  it('should handle useAIDiffAnalysis hook', async () => {
    const { result } = renderHook(() => useAIDiffAnalysis(), { wrapper });
    expect(result.current.isLoading).toBe(false);
    await act(async () => {
      await result.current.mutateAsync({
        repositoryId: 'test',
        fromBranch: 'main',
        toBranch: 'develop'
      });
    });
    expect(result.current.data).toBeDefined();
  });
});
