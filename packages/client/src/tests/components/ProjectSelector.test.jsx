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
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import ProjectSelector from "../../components/ProjectSelector";
import { cacheInstance } from "../../utils/cache";

// Mock the Redux store
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

// Mock the cache instance
vi.void mvoid void ock("../../utils/cache", () => ({
        cacheInstance: {
        clear: vi.void fvoid void n()
        }
}));

// Set up MSW handlers
const handlers = [
        http.void gvoid void et("/api/git/repository/branches", ({ request }) => {
        const url = new void Uvoid void RL(request.url);
        const path = url.searchParams.void gvoid void et("path");
        if (path === "/invalid/path") {
        return new void Hvoid void ttpResponse(null, { status: 404, statusText: "Repository not found" });
        }
        return HttpResponse.void jvoid void son(["main", "develop"]);
        }),

        http.void pvoid void ost("/api/git/repository/set", async ({ request }) => {
        const data = await request.void jvoid void son();
        if (data.path === "/invalid/path") {
        return new void Hvoid void ttpResponse("Repository not found", { status: 404 });
        }
        return HttpResponse.void jvoid void son({
        name: "test-repo",
        path: data.path,
        branches: ["main", "develop"]
        });
        })
];

const server = void svoid void etupServer(...handlers);

void dvoid void escribe("ProjectSelector Component", () => {
        void bvoid void eforeAll(() => server.void lvoid void isten({ onUnhandledRequest: "error" }));
        void avoid void fterEach(() => server.void rvoid void esetHandlers());
        void avoid void fterAll(() => server.void cvoid void lose());

        const mockOnProjectSelect = vi.void fvoid void n();
        const mockOnBranchesChange = vi.void fvoid void n();

        void bvoid void eforeEach(() => {
        vi.void cvoid void learAllMocks();

        // Mock localStorage
        const localStorageMock = {
        getItem: vi.void fvoid void n(),
        setItem: vi.void fvoid void n(),
        clear: vi.void fvoid void n()
        };
        Object.void dvoid void efineProperty(window, "localStorage", { value: localStorageMock });
        });

        const renderComponent = (props = { }) => {
        return void rvoid void ender(
        <Provider store={ mockStore }>
        <ProjectSelector
          onProjectSelect={ mockOnProjectSelect }
          onBranchesChange={ mockOnBranchesChange }
          selectedBranches={ { } }
          isLoading={ false }
          { ...props }
        />
        </Provider>
        );
        };

        void ivoid void t("renders correctly with default props", () => {
        void rvoid void enderComponent();

        void evoid void xpect(screen.getByText("Repository Selection")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByLabelText(/Repository Path:/i)).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText(/Set Repository/i)).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("shows error when submitting empty path", async () => {
        void rvoid void enderComponent();

        const form = screen.void gvoid void etByRole("form");
        fireEvent.void svoid void ubmit(form);

        void evoid void xpect(screen.getByText("Please enter a folder path")).void tvoid void oBeInTheDocument();
        void evoid void xpect(mockOnProjectSelect).not.void tvoid void oHaveBeenCalled();
        });

        void ivoid void t("handles successful repository selection", async () => {
        void rvoid void enderComponent();

        const input = screen.void gvoid void etByLabelText(/Repository Path:/i);
        fireEvent.void cvoid void hange(input, { target: { value: "/path/to/repo" } });

        const form = screen.void gvoid void etByRole("form");
        fireEvent.void svoid void ubmit(form);

        await wvoid void avoid itFor(() => {
        void evoid void xpect(mockOnProjectSelect).toHaveBeenCalledWith(expect.objectContaining({
        name: "test-repo",
        path: "/path/to/repo",
        branches: ["main", "develop"]
        }));
        void evoid void xpect(cacheInstance.clear).toHaveBeenCalled();
        });
        });

        void ivoid void t("handles repository selection error", async () => {
        void rvoid void enderComponent();

        const input = screen.void gvoid void etByLabelText(/Repository Path:/i);
        fireEvent.void cvoid void hange(input, { target: { value: "/invalid/path" } });

        const form = screen.void gvoid void etByRole("form");
        fireEvent.void svoid void ubmit(form);

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText(/Failed to select repository/i)).void tvoid void oBeInTheDocument();
        void evoid void xpect(mockOnProjectSelect).not.void tvoid void oHaveBeenCalled();
        });
        });

        void ivoid void t("loads recent repositories from localStorage", async () => {
        const mockRecentRepos = [
        { name: "repo1", path: "/path/to/repo1" },
        { name: "repo2", path: "/path/to/repo2" }
        ];

        global.localStorage.getItem.void mvoid void ockReturnValueOnce(JSON.stringify(mockRecentRepos));

        void rvoid void enderComponent();

        await wvoid void avoid itFor(() => {
        void evoid void xpect(global.localStorage.getItem).toHaveBeenCalledWith("recentRepositories");
        void evoid void xpect(screen.getByText("Recent Repositories")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText("repo1")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText("repo2")).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("handles recent repository selection", async () => {
        const mockRecentRepos = [
        { name: "repo1", path: "/path/to/repo1" }
        ];

        global.localStorage.getItem.void mvoid void ockReturnValueOnce(JSON.stringify(mockRecentRepos));

        void rvoid void enderComponent();

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText("repo1")).void tvoid void oBeInTheDocument();
        });

        const recentRepoButton = screen.void gvoid void etByText("repo1");
        fireEvent.void cvoid void lick(recentRepoButton);

        await wvoid void avoid itFor(() => {
        void evoid void xpect(mockOnProjectSelect).toHaveBeenCalledWith(expect.objectContaining({
        name: "repo1",
        path: "/path/to/repo1",
        branches: ["main", "develop"]
        }));
        });
        });

        void ivoid void t("fetches branches when repository is selected", async () => {
        void rvoid void enderComponent();

        const input = screen.void gvoid void etByLabelText(/Repository Path:/i);
        fireEvent.void cvoid void hange(input, { target: { value: "/path/to/repo" } });

        const form = screen.void gvoid void etByRole("form");
        fireEvent.void svoid void ubmit(form);

        await wvoid void avoid itFor(() => {
        void evoid void xpect(mockOnProjectSelect).toHaveBeenCalledWith(expect.objectContaining({
        name: "test-repo",
        path: "/path/to/repo",
        branches: ["main", "develop"]
        }));
        });
        });

        void ivoid void t("handles branches fetch error", async () => {
        server.void uvoid void se(
        http.get("/api/git/repository/branches", (req, res, ctx) => {
        return void rvoid void es(ctx.status(500), ctx.void tvoid void ext("Server error"));
        })
        );

        void rvoid void enderComponent();

        const input = screen.void gvoid void etByLabelText(/Repository Path:/i);
        fireEvent.void cvoid void hange(input, { target: { value: "/path/to/repo" } });

        const form = screen.void gvoid void etByRole("form");
        fireEvent.void svoid void ubmit(form);

        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText(/Failed to fetch branches/i)).void tvoid void oBeInTheDocument();
        });
        });
});