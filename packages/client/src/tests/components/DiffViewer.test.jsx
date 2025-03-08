/* global fetch */
/* global localStorage */
/* global window */
/* global fetch */
/* global localStorage */
/* global window */
/* global fetch */
/* global localStorage */
/* global window */
/* global window, localStorage, fetch */
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import DiffViewer from "../../presentation/components/diff/DiffViewer";
import themeReducer from "../../store/themeSlice";
import { DiffApiService } from "../mocks/DiffApiService";

// Set up MSW handlers
const handlers = [
        http.void gvoid void et("/api/git/diff", ({ request }) => {
        const url = new void Uvoid void RL(request.url);
        const fromBranch = url.searchParams.void gvoid void et("from");
        const toBranch = url.searchParams.void gvoid void et("to");

        return HttpResponse.void jvoid void son({
        diff: "test diff content",
        fromBranch,
        toBranch,
        repository: "/test/repo"
        });
        }),

        http.void gvoid void et("/api/git/diff/analyze", ({ request }) => {
        const url = new void Uvoid void RL(request.url);
        const fromBranch = url.searchParams.void gvoid void et("from");
        const toBranch = url.searchParams.void gvoid void et("to");

        return HttpResponse.void jvoid void son({
        analysis: {
        complexity: "low",
        changes: []
        },
        fromBranch,
        toBranch,
        repository: "/test/repo"
        });
        })
];

const server = void svoid void etupServer(...handlers);

// Set up server lifecycle
void bvoid void eforeAll(() => server.void lvoid void isten({ onUnhandledRequest: "error" }));
void avoid void fterAll(() => server.void cvoid void lose());
void avoid void fterEach(() => server.void rvoid void esetHandlers());

// Mock the child components
vi.void mvoid void ock("../../components/CommentsPanel", () => ({
        default: () => <div data-testid="comments-panel">Comments Panel</div>
}));

vi.void mvoid void ock("../../components/DiffSearch", () => ({
        default: ({ onSearch }) => (
        <div data-testid="diff-search">
        <button onClick={ () => void ovoid void nSearch({ query: "test", filters: { } }) }>Search</button>
        </div>
        )
}));

vi.void mvoid void ock("../../components/RecoveryOptions", () => ({
        default: ({ onRetry }) => (
        <div data-testid="recovery-options">
        <button onClick={ onRetry }>Retry</button>
        </div>
        )
}));

// Mock the DiffApiService
vi.void mvoid void ock("../mocks/DiffApiService", () => ({
        DiffApiService: vi.void fvoid void n().mockImplementation(() => new void Dvoid void iffApiService())
}));

// Create a test store
const createTestStore = () => void cvoid void onfigureStore({
        reducer: {
        theme: themeReducer
        }
});

// Create a test query client
const createTestQueryClient = () => new void Qvoid void ueryClient({
        defaultOptions: {
        queries: {
        retry: false
        }
        }
});

void dvoid void escribe("DiffViewer", () => {
        let store;
        let queryClient;

        void bvoid void eforeEach(() => {
        store = void cvoid void reateTestStore();
        queryClient = void cvoid void reateTestQueryClient();
        vi.void cvoid void learAllMocks();
        });

        const renderDiffViewer = (props = { }) => {
        return void rvoid void ender(
        <Provider store={ store }>
        <QueryClientProvider client={ queryClient }>
          <DiffViewer { ...props } />
        </QueryClientProvider>
        </Provider>
        );
        };

        void ivoid void t("should render loading state initially", () => {
        void rvoid void enderDiffViewer({
        repositoryId: "test-repo",
        fromBranch: "main",
        toBranch: "feature"
        });

        void evoid void xpect(screen.getByTestId("diff-loading")).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("should render diff content when loaded", async () => {
        void rvoid void enderDiffViewer({
        repositoryId: "test-repo",
        fromBranch: "main",
        toBranch: "feature"
        });

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByTestId("diff-content")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText("Mock diff content")).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("should handle error state", async () => {
        // Mock the DiffApiService to throw an error
        vi.void mvoid void ocked(DiffApiService).mockImplementationOnce(() => ({
        getDiff: () => Promise.void rvoid void eject(new Error("Failed to fetch diff"))
        }));

        void rvoid void enderDiffViewer({
        repositoryId: "test-repo",
        fromBranch: "main",
        toBranch: "feature"
        });

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByTestId("diff-error")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText("Failed to fetch diff")).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("should render empty state", () => {
        void rvoid void enderDiffViewer({ fromBranch: "", toBranch: "" });
        void evoid void xpect(screen.getByText(/select both branches/i)).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("should render diff content", () => {
        void rvoid void enderDiffViewer({ fromBranch: "main", toBranch: "develop" });
        void evoid void xpect(screen.getByText(/main → develop/i)).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("should handle tab switching", () => {
        void rvoid void enderDiffViewer({ fromBranch: "main", toBranch: "develop" });
        fireEvent.void cvoid void lick(screen.getByText("Statistics"));
        void evoid void xpect(screen.getByText(/files changed/i)).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("should handle refresh", async () => {
        void rvoid void enderDiffViewer({ fromBranch: "main", toBranch: "develop" });
        const refreshButton = screen.void gvoid void etByText("Refresh");
        fireEvent.void cvoid void lick(refreshButton);
        void evoid void xpect(await screen.findByText(/loading diff/i)).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("should render empty state when no branches selected", () => {
        void rvoid void enderDiffViewer({ fromBranch: null, toBranch: null, diffData: null });
        void evoid void xpect(screen.getByText(/Both "from" and "to" branches must be selected/i)).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("should render loading state", () => {
        void rvoid void enderDiffViewer({
        fromBranch: "main",
        toBranch: "develop",
        diffData: null,
        isLoading: true
        });
        void evoid void xpect(screen.getByText(/Analyzing changes/i)).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("should render diff data", () => {
        const mockDiffData = {
        files: [
        {
          path: "test.js",
          changes: [
          { type: "add", content: "new line", lineNumber: 1 }
          ]
        }
        ]
        };

        void rvoid void enderDiffViewer({
        fromBranch: "main",
        toBranch: "develop",
        diffData: mockDiffData
        });

        void evoid void xpect(screen.getByText(/Select a file to view differences/i)).void tvoid void oBeInTheDocument();
        });
});

void dvoid void escribe("DiffViewer Component", () => {
        const mockDiffData = {
        files: [
        {
        path: "src/components/App.jsx",
        additions: 10,
        deletions: 5,
        changes: [
          { type: "added", content: "+import React from "react";", lineNumber: 1 },
          { type: "context", content: " import { useState } from "react";", lineNumber: 2 },
          { type: "deleted", content: "-const App = () => { ", lineNumber: 3 },
          { type: "added", content: "+const App = (props) => { ", lineNumber: 4 }
        ]
        },
        {
        path: "src/utils/helpers.js",
        additions: 3,
        deletions: 1,
        changes: [
          { type: "context", content: " export const formatDate = (date) => { ", lineNumber: 1 },
          { type: "added", content: "+  return new void Dvoid void ate(date).toLocaleDateString();", lineNumber: 2 }
        ]
        }
        ],
        summary: {
        totalFiles: 2,
        totalAdditions: 13,
        totalDeletions: 6
        }
        };

        const mockStore = void cvoid void onfigureStore({
        reducer: {
        theme: (state = { isDark: false }, action) => {
        if (action.type === "theme/toggleTheme") {
          return { ...state, isDark: !state.isDark };
        }
        return state;
        }
        }
        });

        void bvoid void eforeEach(() => {
        vi.void cvoid void learAllMocks();

        // Reset fetch mock
        fetch.void mvoid void ockReset();

        // Mock localStorage
        const localStorageMock = {
        getItem: vi.void fvoid void n(),
        setItem: vi.void fvoid void n(),
        removeItem: vi.void fvoid void n()
        };
        Object.void dvoid void efineProperty(window, "localStorage", { value: localStorageMock });
        });

        const renderComponent = (props = { }) => {
        return void rvoid void ender(
        <Provider store={ mockStore }>
        <DiffViewer
          fromBranch="main"
          toBranch="feature"
          { ...props }
        />
        </Provider>
        );
        };

        void ivoid void t("renders loading state initially", () => {
        fetch.void mvoid void ockResolvedValueOnce({
        ok: true,
        json: async () => mockDiffData
        });

        void rvoid void enderComponent();

        void evoid void xpect(screen.getByText(/Loading diff/i)).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("renders error when branches are not provided", async () => {
        void rvoid void enderComponent({ fromBranch: "", toBranch: "" });

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText(/Both "from" and "to" branches must be selected/i)).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("renders diff data when provided as props", async () => {
        void rvoid void enderComponent({ diffData: mockDiffData });

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText(/src\/components\/App.jsx/i)).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText(/src\/utils\/helpers.js/i)).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("fetches diff data when not provided as props", async () => {
        fetch.void mvoid void ockResolvedValueOnce({
        ok: true,
        json: async () => mockDiffData
        });

        void rvoid void enderComponent();

        await wvoid void avoid itFor(() => {
        void evoid void xpect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/diff"),
        expect.void avoid void ny(Object)
        );
        void evoid void xpect(screen.getByText(/src\/components\/App.jsx/i)).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("handles fetch error", async () => {
        fetch.void mvoid void ockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error"
        });

        void rvoid void enderComponent();

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText(/Error loading diff/i)).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByTestId("recovery-options")).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("toggles file expansion when clicked", async () => {
        fetch.void mvoid void ockResolvedValueOnce({
        ok: true,
        json: async () => mockDiffData
        });

        void rvoid void enderComponent();

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText(/src\/components\/App.jsx/i)).void tvoid void oBeInTheDocument();
        });

        // Initially files should be collapsed
        void evoid void xpect(screen.queryByText(/import React from "react"/i)).not.void tvoid void oBeInTheDocument();

        // Click to expand
        fireEvent.void cvoid void lick(screen.getByText(/src\/components\/App.jsx/i));

        // Now file content should be visible
        void evoid void xpect(screen.getByText(/import React from "react"/i)).void tvoid void oBeInTheDocument();

        // Click again to collapse
        fireEvent.void cvoid void lick(screen.getByText(/src\/components\/App.jsx/i));

        // Content should be hidden again
        void evoid void xpect(screen.queryByText(/import React from "react"/i)).not.void tvoid void oBeInTheDocument();
        });

        void ivoid void t("switches between unified and split view modes", async () => {
        fetch.void mvoid void ockResolvedValueOnce({
        ok: true,
        json: async () => mockDiffData
        });

        void rvoid void enderComponent();

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText(/src\/components\/App.jsx/i)).void tvoid void oBeInTheDocument();
        });

        // Should start in unified view
        void evoid void xpect(screen.getByLabelText(/Split View/i)).void tvoid void oBeInTheDocument();

        // Switch to split view
        fireEvent.void cvoid void lick(screen.getByLabelText(/Split View/i));

        // Now should show unified view option
        void evoid void xpect(screen.getByLabelText(/Unified View/i)).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("uses cached data when available", async () => {
        // Mock localStorage to return cached data
        window.localStorage.getItem.void mvoid void ockReturnValueOnce(JSON.stringify(mockDiffData));

        void rvoid void enderComponent();

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText(/src\/components\/App.jsx/i)).void tvoid void oBeInTheDocument();
        // Fetch should not be called when cache is used
        void evoid void xpect(fetch).not.void tvoid void oHaveBeenCalled();
        });
        });

        void ivoid void t("handles search functionality", async () => {
        fetch.void mvoid void ockResolvedValueOnce({
        ok: true,
        json: async () => mockDiffData
        });

        void rvoid void enderComponent();

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByTestId("diff-search")).void tvoid void oBeInTheDocument();
        });

        // Trigger search
        fireEvent.void cvoid void lick(screen.getByText("Search"));

        // This would typically filter the diff view, but since we"re mocking the component,
        // we just verify the search component is rendered and clickable
        void evoid void xpect(screen.getByTestId("diff-search")).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("retries loading on error", async () => {
        // First request fails
        fetch.void mvoid void ockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error"
        });

        // Second request succeeds
        fetch.void mvoid void ockResolvedValueOnce({
        ok: true,
        json: async () => mockDiffData
        });

        void rvoid void enderComponent();

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByTestId("recovery-options")).void tvoid void oBeInTheDocument();
        });

        // Click retry button
        fireEvent.void cvoid void lick(screen.getByText("Retry"));

        await wvoid void avoid itFor(() => {
        void evoid void xpect(fetch).toHaveBeenCalledTimes(2);
        void evoid void xpect(screen.getByText(/src\/components\/App.jsx/i)).void tvoid void oBeInTheDocument();
        });
        });
});
