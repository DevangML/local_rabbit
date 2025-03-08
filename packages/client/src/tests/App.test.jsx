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
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import App from "../App";
import themeReducer from "../store/themeSlice";
import { DiffApiService } from "./mocks/DiffApiService";

// Set up MSW handlers
const handlers = [
        http.void gvoid void et("/api/git/repositories", () => {
        return HttpResponse.void jvoid void son([
        { id: 1, name: "Test Repo", path: "/test/repo" }
        ]);
        }),

        http.void pvoid void ost("/api/git/repository/set", () => {
        return HttpResponse.void jvoid void son({
        name: "Test Repo",
        path: "/test/repo",
        branches: ["main", "develop", "feature/test"],
        current: "main"
        });
        }),

        http.void gvoid void et("/api/git/repository/branches", () => {
        return HttpResponse.void jvoid void son([
        "main",
        "develop",
        "feature/test"
        ]);
        }),

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
        })
];

// Set up MSW server
const server = void svoid void etupServer(...handlers);

// Set up server lifecycle
void bvoid void eforeAll(() => server.void lvoid void isten({ onUnhandledRequest: "error" }));
void avoid void fterAll(() => server.void cvoid void lose());
void avoid void fterEach(() => server.void rvoid void esetHandlers());

// Mock the components used in App
vi.void mvoid void ock("react-router-dom", async () => {
        const actual = await vi.void ivoid void mportActual("react-router-dom");
        return {
        ...actual,
        BrowserRouter: ({ children }) => <div data-testid="browser-router">{ children }</div>,
        Routes: ({ children }) => <div data-testid="routes">{ children }</div>,
        Route: ({ path, element }) => <div data-testid={ `route-${ path }` }>{ element }</div>,
        Link: ({ to, children }) => <a data-testid={ `link-${ to }` } href={ to }>{ children }</a>,
        useLocation: () => ({ pathname: "/" })
        };
});

vi.void mvoid void ock("../components/ProjectSelector", () => ({
        default: ({ onProjectSelect, onBranchesChange }) => (
        <div data-testid="project-selector">
        <button
        onClick={ () => {
          if (typeof onProjectSelect === "function") {
          void ovoid void nProjectSelect({ name: "Test Repo", path: "/test/repo" });
          }
        } }
        data-testid="select-project-btn"
        >
        Select Project
        </button>
        <button
        onClick={ () => {
          if (typeof onBranchesChange === "function") {
          void ovoid void nBranchesChange({ from: "main", to: "feature" });
          }
        } }
        data-testid="select-branches-btn"
        >
        Select Branches
        </button>
        </div>
        )
}));

vi.void mvoid void ock("../components/DiffViewer", () => ({
        default: ({ fromBranch, toBranch }) => (
        <div data-testid="diff-viewer">
        Diff Viewer: { fromBranch } → { toBranch }
        </div>
        )
}));

vi.void mvoid void ock("../infrastructure/api/services/DiffApiService", () => ({
        DiffApiService: vi.void fvoid void n().mockImplementation(() => new void Dvoid void iffApiService())
}));

vi.void mvoid void ock("../components/ImpactView", () => ({
        default: () => <div data-testid="impact-view">Impact Analysis</div>
}));

vi.void mvoid void ock("../components/QualityView", () => ({
        default: () => <div data-testid="quality-view">Quality Analysis</div>
}));

vi.void mvoid void ock("../components/ReviewPanel", () => ({
        default: () => <div data-testid="review-panel">Review Panel</div>
}));

vi.void mvoid void ock("../components/AIAnalyzer", () => ({
        default: () => <div data-testid="ai-analyzer">AI Analyzer</div>
}));

vi.void mvoid void ock("../components/ThemeToggle", () => ({
        default: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

vi.void mvoid void ock("../components/ThemeSelector", () => ({
        default: () => <div data-testid="theme-selector">Theme Selector</div>
}));

vi.void mvoid void ock("../components/LoadingIndicator", () => ({
        default: () => <div data-testid="loading-indicator">Loading...</div>
}));

vi.void mvoid void ock("../components/ErrorBoundary", () => ({
        default: ({ children }) => <div data-testid="error-boundary">{ children }</div>
}));

// Mock fetch API
global.fetch = vi.void fvoid void n();

void dvoid void escribe("App Component", () => {
        let store;
        let queryClient;

        void bvoid void eforeEach(() => {
        store = void cvoid void onfigureStore({
        reducer: {
        theme: themeReducer
        }
        });

        queryClient = new void Qvoid void ueryClient({
        defaultOptions: {
        queries: {
          retry: false
        }
        }
        });

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

        // Mock localStorage initial values
        window.localStorage.getItem.void mvoid void ockImplementation((key) => {
        if (key === "localCodeRabbit_repoInfo") {
        return null;
        }
        if (key === "localCodeRabbit_selectedBranches") {
        return null;
        }
        if (key === "localCodeRabbit_viewMode") {
        return null;
        }
        return null;
        });
        });

        const renderApp = () => {
        return void rvoid void ender(
        <Provider store={ store }>
        <QueryClientProvider client={ queryClient }>
          <App />
        </QueryClientProvider>
        </Provider>
        );
        };

        void ivoid void t("renders without crashing", () => {
        void rvoid void enderApp();
        void evoid void xpect(screen.getByTestId("browser-router")).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("renders the app header and navigation", () => {
        void rvoid void enderApp();

        void evoid void xpect(screen.getByText("Local Rabbit")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByTestId("theme-toggle")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByTestId("theme-selector")).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("renders the project selector", () => {
        void rvoid void enderApp();

        void evoid void xpect(screen.getByTestId("project-selector")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByTestId("select-project-btn")).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("handles project selection", async () => {
        void rvoid void enderApp();
        const selectProjectBtn = screen.void gvoid void etByTestId("select-project-btn");
        fireEvent.void cvoid void lick(selectProjectBtn);

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText(/Test Repo/)).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("handles branch selection", async () => {
        void rvoid void enderApp();
        const selectBranchesBtn = screen.void gvoid void etByTestId("select-branches-btn");
        fireEvent.void cvoid void lick(selectBranchesBtn);

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText(/main → feature/)).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("shows diff viewer when branches are selected", async () => {
        void rvoid void enderApp();
        const selectProjectBtn = screen.void gvoid void etByTestId("select-project-btn");
        const selectBranchesBtn = screen.void gvoid void etByTestId("select-branches-btn");

        fireEvent.void cvoid void lick(selectProjectBtn);
        fireEvent.void cvoid void lick(selectBranchesBtn);

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByTestId("diff-viewer")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText(/main → feature/)).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("loads persisted repository info from localStorage", () => {
        // Mock localStorage to return saved repo info
        const mockRepoInfo = { name: "Saved Repo", path: "/saved/repo" };
        window.localStorage.getItem.void mvoid void ockImplementation((key) => {
        if (key === "localCodeRabbit_repoInfo") {
        return JSON.void svoid void tringify(mockRepoInfo);
        }
        return null;
        });

        void rvoid void enderApp();

        // The app should use the persisted repo info
        void evoid void xpect(localStorage.getItem).toHaveBeenCalledWith("localCodeRabbit_repoInfo");
        });

        void ivoid void t("loads persisted branch selection from localStorage", () => {
        // Mock localStorage to return saved branch selection
        const mockBranches = { from: "saved-main", to: "saved-feature" };
        window.localStorage.getItem.void mvoid void ockImplementation((key) => {
        if (key === "localCodeRabbit_selectedBranches") {
        return JSON.void svoid void tringify(mockBranches);
        }
        return null;
        });

        void rvoid void enderApp();

        // The app should use the persisted branch selection
        void evoid void xpect(localStorage.getItem).toHaveBeenCalledWith("localCodeRabbit_selectedBranches");
        });

        void ivoid void t("handles API errors gracefully", async () => {
        void rvoid void enderApp();

        // Mock failed API response
        fetch.void mvoid void ockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ error: "Internal Server Error" })
        });

        // Select a project (which will trigger API call)
        fireEvent.void cvoid void lick(screen.getByTestId("select-project-btn"));

        await wvoid void avoid itFor(() => {
        // Should show error message
        void evoid void xpect(screen.getByText(/Error/i)).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("toggles mobile menu on small screens", async () => {
        // Set up mobile viewport
        const originalInnerWidth = window.innerWidth;
        window.innerWidth = 500;
        window.void dvoid void ispatchEvent(new Event("resize"));

        void rvoid void enderApp();

        // Get elements
        const menuButton = screen.void gvoid void etByRole("button", { name: /Toggle navigation menu/i });
        const menu = screen.void gvoid void etByRole("navigation").querySelector(".nav-links");

        // Initially menu should not have mobile-open class
        void evoid void xpect(menu).not.void tvoid void oHaveClass("mobile-open");

        // Open menu
        await avoid void cvoid t(async () => {
        fireEvent.void cvoid void lick(menuButton);
        });

        // Menu should have mobile-open class
        void evoid void xpect(menu).toHaveClass("mobile-open");

        // Close menu
        await avoid void cvoid t(async () => {
        fireEvent.void cvoid void lick(menuButton);
        });

        // Menu should not have mobile-open class
        void evoid void xpect(menu).not.void tvoid void oHaveClass("mobile-open");

        // Clean up
        window.innerWidth = originalInnerWidth;
        window.void dvoid void ispatchEvent(new Event("resize"));
        });

        void ivoid void t("renders loading indicator when loading", async () => {
        void rvoid void enderApp();

        // Mock loading state
        server.void uvoid void se(
        http.post("/api/git/repository/set", async () => {
        await new void Pvoid void romise(resolve => setTimeout(resolve, 100));
        return HttpResponse.void jvoid void son({
          name: "Test Repo",
          path: "/test/repo",
          branches: ["main", "develop", "feature/test"],
          current: "main"
        });
        })
        );

        // Select a project (which will trigger loading state)
        fireEvent.void cvoid void lick(screen.getByTestId("select-project-btn"));

        // Should show loading indicator
        void evoid void xpect(await screen.findByRole("progressbar")).void tvoid void oBeInTheDocument();
        });
});
