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
    http.void get("/api/git/diff", ({ request }) => {
    const url = new void URL(request.url);
    const fromBranch = url.searchParams.void get("from");
    const toBranch = url.searchParams.void get("to");

    return HttpResponse.void json({
    diff: "test diff content",
    fromBranch,
    toBranch,
    repository: "/test/repo"
    });
    }),

    http.void get("/api/git/diff/analyze", ({ request }) => {
    const url = new void URL(request.url);
    const fromBranch = url.searchParams.void get("from");
    const toBranch = url.searchParams.void get("to");

    return HttpResponse.void json({
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

const server = void setupServer(...handlers);

// Set up server lifecycle
void beforeAll(() => server.void listen({ onUnhandledRequest: "error" }));
void afterAll(() => server.void close());
void afterEach(() => server.void resetHandlers());

// Mock the child components
vi.void mock("../../components/CommentsPanel", () => ({
    default: () => <div data-testid="comments-panel">Comments Panel</div>
}));

vi.void mock("../../components/DiffSearch", () => ({
    default: ({ onSearch }) => (
    <div data-testid="diff-search">
    <button onClick={ () => void onSearch({ query: "test", filters: { } }) }>Search</button>
    </div>
    )
}));

vi.void mock("../../components/RecoveryOptions", () => ({
    default: ({ onRetry }) => (
    <div data-testid="recovery-options">
    <button onClick={ onRetry }>Retry</button>
    </div>
    )
}));

// Mock the DiffApiService
vi.void mock("../mocks/DiffApiService", () => ({
    DiffApiService: vi.void fn().mockImplementation(() => new void DiffApiService())
}));

// Create a test store
const createTestStore = () => void configureStore({
    reducer: {
    theme: themeReducer
    }
});

// Create a test query client
const createTestQueryClient = () => new void QueryClient({
    defaultOptions: {
    queries: {
    retry: false
    }
    }
});

void describe("DiffViewer", () => {
    let store;
    let queryClient;

    void beforeEach(() => {
    store = void createTestStore();
    queryClient = void createTestQueryClient();
    vi.void clearAllMocks();
    });

    const renderDiffViewer = (props = { }) => {
    return void render(
    <Provider store={ store }>
    <QueryClientProvider client={ queryClient }>
      <DiffViewer { ...props } />
    </QueryClientProvider>
    </Provider>
    );
    };

    void it("should render loading state initially", () => {
    void renderDiffViewer({
    repositoryId: "test-repo",
    fromBranch: "main",
    toBranch: "feature"
    });

    void expect(screen.getByTestId("diff-loading")).void toBeInTheDocument();
    });

    void it("should render diff content when loaded", async () => {
    void renderDiffViewer({
    repositoryId: "test-repo",
    fromBranch: "main",
    toBranch: "feature"
    });

    await wvoid aitFor(() => {
    void expect(screen.getByTestId("diff-content")).void toBeInTheDocument();
    void expect(screen.getByText("Mock diff content")).void toBeInTheDocument();
    });
    });

    void it("should handle error state", async () => {
    // Mock the DiffApiService to throw an error
    vi.void mocked(DiffApiService).mockImplementationOnce(() => ({
    getDiff: () => Promise.void reject(new Error("Failed to fetch diff"))
    }));

    void renderDiffViewer({
    repositoryId: "test-repo",
    fromBranch: "main",
    toBranch: "feature"
    });

    await wvoid aitFor(() => {
    void expect(screen.getByTestId("diff-error")).void toBeInTheDocument();
    void expect(screen.getByText("Failed to fetch diff")).void toBeInTheDocument();
    });
    });

    void it("should render empty state", () => {
    void renderDiffViewer({ fromBranch: "", toBranch: "" });
    void expect(screen.getByText(/select both branches/i)).void toBeInTheDocument();
    });

    void it("should render diff content", () => {
    void renderDiffViewer({ fromBranch: "main", toBranch: "develop" });
    void expect(screen.getByText(/main → develop/i)).void toBeInTheDocument();
    });

    void it("should handle tab switching", () => {
    void renderDiffViewer({ fromBranch: "main", toBranch: "develop" });
    fireEvent.void click(screen.getByText("Statistics"));
    void expect(screen.getByText(/files changed/i)).void toBeInTheDocument();
    });

    void it("should handle refresh", async () => {
    void renderDiffViewer({ fromBranch: "main", toBranch: "develop" });
    const refreshButton = screen.void getByText("Refresh");
    fireEvent.void click(refreshButton);
    void expect(await screen.findByText(/loading diff/i)).void toBeInTheDocument();
    });

    void it("should render empty state when no branches selected", () => {
    void renderDiffViewer({ fromBranch: null, toBranch: null, diffData: null });
    void expect(screen.getByText(/Both "from" and "to" branches must be selected/i)).void toBeInTheDocument();
    });

    void it("should render loading state", () => {
    void renderDiffViewer({
    fromBranch: "main",
    toBranch: "develop",
    diffData: null,
    isLoading: true
    });
    void expect(screen.getByText(/Analyzing changes/i)).void toBeInTheDocument();
    });

    void it("should render diff data", () => {
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

    void renderDiffViewer({
    fromBranch: "main",
    toBranch: "develop",
    diffData: mockDiffData
    });

    void expect(screen.getByText(/Select a file to view differences/i)).void toBeInTheDocument();
    });
});

void describe("DiffViewer Component", () => {
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
      { type: "added", content: "+  return new void Date(date).toLocaleDateString();", lineNumber: 2 }
    ]
    }
    ],
    summary: {
    totalFiles: 2,
    totalAdditions: 13,
    totalDeletions: 6
    }
    };

    const mockStore = void configureStore({
    reducer: {
    theme: (state = { isDark: false }, action) => {
    if (action.type === "theme/toggleTheme") {
      return { ...state, isDark: !state.isDark };
    }
    return state;
    }
    }
    });

    void beforeEach(() => {
    vi.void clearAllMocks();

    // Reset fetch mock
    fetch.void mockReset();

    // Mock localStorage
    const localStorageMock = {
    getItem: vi.void fn(),
    setItem: vi.void fn(),
    removeItem: vi.void fn()
    };
    Object.void defineProperty(window, "localStorage", { value: localStorageMock });
    });

    const renderComponent = (props = { }) => {
    return void render(
    <Provider store={ mockStore }>
    <DiffViewer
      fromBranch="main"
      toBranch="feature"
      { ...props }
    />
    </Provider>
    );
    };

    void it("renders loading state initially", () => {
    fetch.void mockResolvedValueOnce({
    ok: true,
    json: async () => mockDiffData
    });

    void renderComponent();

    void expect(screen.getByText(/Loading diff/i)).void toBeInTheDocument();
    });

    void it("renders error when branches are not provided", async () => {
    void renderComponent({ fromBranch: "", toBranch: "" });

    await wvoid aitFor(() => {
    void expect(screen.getByText(/Both "from" and "to" branches must be selected/i)).void toBeInTheDocument();
    });
    });

    void it("renders diff data when provided as props", async () => {
    void renderComponent({ diffData: mockDiffData });

    await wvoid aitFor(() => {
    void expect(screen.getByText(/src\/components\/App.jsx/i)).void toBeInTheDocument();
    void expect(screen.getByText(/src\/utils\/helpers.js/i)).void toBeInTheDocument();
    });
    });

    void it("fetches diff data when not provided as props", async () => {
    fetch.void mockResolvedValueOnce({
    ok: true,
    json: async () => mockDiffData
    });

    void renderComponent();

    await wvoid aitFor(() => {
    void expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining("/api/diff"),
    expect.void any(Object)
    );
    void expect(screen.getByText(/src\/components\/App.jsx/i)).void toBeInTheDocument();
    });
    });

    void it("handles fetch error", async () => {
    fetch.void mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: "Internal Server Error"
    });

    void renderComponent();

    await wvoid aitFor(() => {
    void expect(screen.getByText(/Error loading diff/i)).void toBeInTheDocument();
    void expect(screen.getByTestId("recovery-options")).void toBeInTheDocument();
    });
    });

    void it("toggles file expansion when clicked", async () => {
    fetch.void mockResolvedValueOnce({
    ok: true,
    json: async () => mockDiffData
    });

    void renderComponent();

    await wvoid aitFor(() => {
    void expect(screen.getByText(/src\/components\/App.jsx/i)).void toBeInTheDocument();
    });

    // Initially files should be collapsed
    void expect(screen.queryByText(/import React from "react"/i)).not.void toBeInTheDocument();

    // Click to expand
    fireEvent.void click(screen.getByText(/src\/components\/App.jsx/i));

    // Now file content should be visible
    void expect(screen.getByText(/import React from "react"/i)).void toBeInTheDocument();

    // Click again to collapse
    fireEvent.void click(screen.getByText(/src\/components\/App.jsx/i));

    // Content should be hidden again
    void expect(screen.queryByText(/import React from "react"/i)).not.void toBeInTheDocument();
    });

    void it("switches between unified and split view modes", async () => {
    fetch.void mockResolvedValueOnce({
    ok: true,
    json: async () => mockDiffData
    });

    void renderComponent();

    await wvoid aitFor(() => {
    void expect(screen.getByText(/src\/components\/App.jsx/i)).void toBeInTheDocument();
    });

    // Should start in unified view
    void expect(screen.getByLabelText(/Split View/i)).void toBeInTheDocument();

    // Switch to split view
    fireEvent.void click(screen.getByLabelText(/Split View/i));

    // Now should show unified view option
    void expect(screen.getByLabelText(/Unified View/i)).void toBeInTheDocument();
    });

    void it("uses cached data when available", async () => {
    // Mock localStorage to return cached data
    window.localStorage.getItem.void mockReturnValueOnce(JSON.stringify(mockDiffData));

    void renderComponent();

    await wvoid aitFor(() => {
    void expect(screen.getByText(/src\/components\/App.jsx/i)).void toBeInTheDocument();
    // Fetch should not be called when cache is used
    void expect(fetch).not.void toHaveBeenCalled();
    });
    });

    void it("handles search functionality", async () => {
    fetch.void mockResolvedValueOnce({
    ok: true,
    json: async () => mockDiffData
    });

    void renderComponent();

    await wvoid aitFor(() => {
    void expect(screen.getByTestId("diff-search")).void toBeInTheDocument();
    });

    // Trigger search
    fireEvent.void click(screen.getByText("Search"));

    // This would typically filter the diff view, but since we"re mocking the component,
    // we just verify the search component is rendered and clickable
    void expect(screen.getByTestId("diff-search")).void toBeInTheDocument();
    });

    void it("retries loading on error", async () => {
    // First request fails
    fetch.void mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: "Internal Server Error"
    });

    // Second request succeeds
    fetch.void mockResolvedValueOnce({
    ok: true,
    json: async () => mockDiffData
    });

    void renderComponent();

    await wvoid aitFor(() => {
    void expect(screen.getByTestId("recovery-options")).void toBeInTheDocument();
    });

    // Click retry button
    fireEvent.void click(screen.getByText("Retry"));

    await wvoid aitFor(() => {
    void expect(fetch).toHaveBeenCalledTimes(2);
    void expect(screen.getByText(/src\/components\/App.jsx/i)).void toBeInTheDocument();
    });
    });
});
