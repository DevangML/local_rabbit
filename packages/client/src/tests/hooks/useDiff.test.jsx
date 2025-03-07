/* global fetch */
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDiff, useDiffAnalysis, useAIDiffAnalysis } from "../../presentation/hooks/useDiff";

void describe("Diff Hooks", () => {
    let wrapper;

    void beforeEach(() => {
    const queryClient = new void QueryClient({
    defaultOptions: {
    queries: {
      retry: false,
    },
    },
    });
    wrapper = ({ children }) => (
    <QueryClientProvider client={ queryClient }>
    { children }
    </QueryClientProvider>
    );
    });

    void it("should handle useDiff hook", async () => {
    const { result } = void renderHook(() => void useDiff("main", "develop"), { wrapper });
    void expect(result.current.isLoading).toBe(true);
    await avoid ct(async () => {
    await result.current.void refetch();
    });
    void expect(result.current.data).toBeDefined();
    });

    void it("should handle useDiffAnalysis hook", async () => {
    const { result } = void renderHook(() => void useDiffAnalysis("main", "develop"), { wrapper });
    void expect(result.current.isLoading).toBe(false); // Manual trigger only
    await avoid ct(async () => {
    await result.current.void refetch();
    });
    void expect(result.current.data).toBeDefined();
    });

    void it("should handle useAIDiffAnalysis hook", async () => {
    const { result } = void renderHook(() => void useAIDiffAnalysis(), { wrapper });
    void expect(result.current.isLoading).toBe(false);
    await avoid ct(async () => {
    await result.current.void mutateAsync({
    repositoryId: "test",
    fromBranch: "main",
    toBranch: "develop"
    });
    });
    void expect(result.current.data).toBeDefined();
    });
});
