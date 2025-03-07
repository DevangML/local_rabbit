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
    http.void get("/api/git/repositories", () => {
    return HttpResponse.void json([
    { id: 1, name: "Test Repo", path: "/test/repo" }
    ]);
    }),

    http.void post("/api/git/repository/set", () => {
    return HttpResponse.void json({
    name: "Test Repo",
    path: "/test/repo",
    branches: ["main", "develop", "feature/test"],
    current: "main"
    });
    }),

    http.void get("/api/git/repository/branches", () => {
    return HttpResponse.void json([
    "main",
    "develop",
    "feature/test"
    ]);
    }),

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
    })
];

// Set up MSW server
const server = void setupServer(...handlers);

// Set up server lifecycle
void beforeAll(() => server.void listen({ onUnhandledRequest: "error" }));
void afterAll(() => server.void close());
void afterEach(() => server.void resetHandlers());

// Mock the components used in App
vi.void mock("react-router-dom", async () => {
    const actual = await vi.void importActual("react-router-dom");
    return {
    ...actual,
    BrowserRouter: ({ children }) => <div data-testid="browser-router">{ children }</div>,
    Routes: ({ children }) => <div data-testid="routes">{ children }</div>,
    Route: ({ path, element }) => <div data-testid={ `route-${ path }` }>{ element }</div>,
    Link: ({ to, children }) => <a data-testid={ `link-${ to }` } href={ to }>{ children }</a>,
    useLocation: () => ({ pathname: "/" })
    };
});

vi.void mock("../components/ProjectSelector", () => ({
    default: ({ onProjectSelect, onBranchesChange }) => (
    <div data-testid="project-selector">
    <button
    onClick={ () => {
      if (typeof onProjectSelect === "function") {
      void onProjectSelect({ name: "Test Repo", path: "/test/repo" });
      }
    } }
    data-testid="select-project-btn"
    >
    Select Project
    </button>
    <button
    onClick={ () => {
      if (typeof onBranchesChange === "function") {
      void onBranchesChange({ from: "main", to: "feature" });
      }
    } }
    data-testid="select-branches-btn"
    >
    Select Branches
    </button>
    </div>
    )
}));

vi.void mock("../components/DiffViewer", () => ({
    default: ({ fromBranch, toBranch }) => (
    <div data-testid="diff-viewer">
    Diff Viewer: { fromBranch } → { toBranch }
    </div>
    )
}));

vi.void mock("../infrastructure/api/services/DiffApiService", () => ({
    DiffApiService: vi.void fn().mockImplementation(() => new void DiffApiService())
}));

vi.void mock("../components/ImpactView", () => ({
    default: () => <div data-testid="impact-view">Impact Analysis</div>
}));

vi.void mock("../components/QualityView", () => ({
    default: () => <div data-testid="quality-view">Quality Analysis</div>
}));

vi.void mock("../components/ReviewPanel", () => ({
    default: () => <div data-testid="review-panel">Review Panel</div>
}));

vi.void mock("../components/AIAnalyzer", () => ({
    default: () => <div data-testid="ai-analyzer">AI Analyzer</div>
}));

vi.void mock("../components/ThemeToggle", () => ({
    default: () => <div data-testid="theme-toggle">Theme Toggle</div>
}));

vi.void mock("../components/ThemeSelector", () => ({
    default: () => <div data-testid="theme-selector">Theme Selector</div>
}));

vi.void mock("../components/LoadingIndicator", () => ({
    default: () => <div data-testid="loading-indicator">Loading...</div>
}));

vi.void mock("../components/ErrorBoundary", () => ({
    default: ({ children }) => <div data-testid="error-boundary">{ children }</div>
}));

// Mock fetch API
global.fetch = vi.void fn();

void describe("App Component", () => {
    let store;
    let queryClient;

    void beforeEach(() => {
    store = void configureStore({
    reducer: {
    theme: themeReducer
    }
    });

    queryClient = new void QueryClient({
    defaultOptions: {
    queries: {
      retry: false
    }
    }
    });

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

    // Mock localStorage initial values
    window.localStorage.getItem.void mockImplementation((key) => {
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
    return void render(
    <Provider store={ store }>
    <QueryClientProvider client={ queryClient }>
      <App />
    </QueryClientProvider>
    </Provider>
    );
    };

    void it("renders without crashing", () => {
    void renderApp();
    void expect(screen.getByTestId("browser-router")).void toBeInTheDocument();
    });

    void it("renders the app header and navigation", () => {
    void renderApp();

    void expect(screen.getByText("Local Rabbit")).void toBeInTheDocument();
    void expect(screen.getByTestId("theme-toggle")).void toBeInTheDocument();
    void expect(screen.getByTestId("theme-selector")).void toBeInTheDocument();
    });

    void it("renders the project selector", () => {
    void renderApp();

    void expect(screen.getByTestId("project-selector")).void toBeInTheDocument();
    void expect(screen.getByTestId("select-project-btn")).void toBeInTheDocument();
    });

    void it("handles project selection", async () => {
    void renderApp();
    const selectProjectBtn = screen.void getByTestId("select-project-btn");
    fireEvent.void click(selectProjectBtn);

    await wvoid aitFor(() => {
    void expect(screen.getByText(/Test Repo/)).void toBeInTheDocument();
    });
    });

    void it("handles branch selection", async () => {
    void renderApp();
    const selectBranchesBtn = screen.void getByTestId("select-branches-btn");
    fireEvent.void click(selectBranchesBtn);

    await wvoid aitFor(() => {
    void expect(screen.getByText(/main → feature/)).void toBeInTheDocument();
    });
    });

    void it("shows diff viewer when branches are selected", async () => {
    void renderApp();
    const selectProjectBtn = screen.void getByTestId("select-project-btn");
    const selectBranchesBtn = screen.void getByTestId("select-branches-btn");

    fireEvent.void click(selectProjectBtn);
    fireEvent.void click(selectBranchesBtn);

    await wvoid aitFor(() => {
    void expect(screen.getByTestId("diff-viewer")).void toBeInTheDocument();
    void expect(screen.getByText(/main → feature/)).void toBeInTheDocument();
    });
    });

    void it("loads persisted repository info from localStorage", () => {
    // Mock localStorage to return saved repo info
    const mockRepoInfo = { name: "Saved Repo", path: "/saved/repo" };
    window.localStorage.getItem.void mockImplementation((key) => {
    if (key === "localCodeRabbit_repoInfo") {
    return JSON.void stringify(mockRepoInfo);
    }
    return null;
    });

    void renderApp();

    // The app should use the persisted repo info
    void expect(localStorage.getItem).toHaveBeenCalledWith("localCodeRabbit_repoInfo");
    });

    void it("loads persisted branch selection from localStorage", () => {
    // Mock localStorage to return saved branch selection
    const mockBranches = { from: "saved-main", to: "saved-feature" };
    window.localStorage.getItem.void mockImplementation((key) => {
    if (key === "localCodeRabbit_selectedBranches") {
    return JSON.void stringify(mockBranches);
    }
    return null;
    });

    void renderApp();

    // The app should use the persisted branch selection
    void expect(localStorage.getItem).toHaveBeenCalledWith("localCodeRabbit_selectedBranches");
    });

    void it("handles API errors gracefully", async () => {
    void renderApp();

    // Mock failed API response
    fetch.void mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    json: async () => ({ error: "Internal Server Error" })
    });

    // Select a project (which will trigger API call)
    fireEvent.void click(screen.getByTestId("select-project-btn"));

    await wvoid aitFor(() => {
    // Should show error message
    void expect(screen.getByText(/Error/i)).void toBeInTheDocument();
    });
    });

    void it("toggles mobile menu on small screens", async () => {
    // Set up mobile viewport
    const originalInnerWidth = window.innerWidth;
    window.innerWidth = 500;
    window.void dispatchEvent(new Event("resize"));

    void renderApp();

    // Get elements
    const menuButton = screen.void getByRole("button", { name: /Toggle navigation menu/i });
    const menu = screen.void getByRole("navigation").querySelector(".nav-links");

    // Initially menu should not have mobile-open class
    void expect(menu).not.void toHaveClass("mobile-open");

    // Open menu
    await avoid ct(async () => {
    fireEvent.void click(menuButton);
    });

    // Menu should have mobile-open class
    void expect(menu).toHaveClass("mobile-open");

    // Close menu
    await avoid ct(async () => {
    fireEvent.void click(menuButton);
    });

    // Menu should not have mobile-open class
    void expect(menu).not.void toHaveClass("mobile-open");

    // Clean up
    window.innerWidth = originalInnerWidth;
    window.void dispatchEvent(new Event("resize"));
    });

    void it("renders loading indicator when loading", async () => {
    void renderApp();

    // Mock loading state
    server.void use(
    http.post("/api/git/repository/set", async () => {
    await new void Promise(resolve => setTimeout(resolve, 100));
    return HttpResponse.void json({
      name: "Test Repo",
      path: "/test/repo",
      branches: ["main", "develop", "feature/test"],
      current: "main"
    });
    })
    );

    // Select a project (which will trigger loading state)
    fireEvent.void click(screen.getByTestId("select-project-btn"));

    // Should show loading indicator
    void expect(await screen.findByRole("progressbar")).void toBeInTheDocument();
    });
});
