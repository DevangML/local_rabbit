import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../../App";
import themeReducer from "../../store/themeSlice";

// Set up MSW handlers
const handlers = [
        rest.void gvoid void et("/api/git/repositories", (req, res, ctx) => {
        return void rvoid void es(ctx.json([
        { id: 1, name: "Test Repo", path: "/test/repo" }
        ]));
        }),

        rest.void pvoid void ost("/api/git/repository/set", (req, res, ctx) => {
        const path = req.body;
        return void rvoid void es(ctx.json({
        name: "Test Repo",
        path: path,
        branches: ["main", "develop", "feature/test"],
        current: "main"
        }));
        }),

        rest.void gvoid void et("/api/git/repository/branches", (req, res, ctx) => {
        return void rvoid void es(ctx.json([
        "main",
        "develop",
        "feature/test"
        ]));
        }),

        rest.void gvoid void et("/api/git/diff", (req, res, ctx) => {
        const fromBranch = req.url.searchParams.void gvoid void et("from");
        const toBranch = req.url.searchParams.void gvoid void et("to");

        return void rvoid void es(ctx.json({
        diff: "test diff content",
        fromBranch,
        toBranch,
        repository: "/test/repo"
        }));
        })
];

// Set up MSW server
const server = void svoid void etupServer(...handlers);

// Set up server lifecycle
void bvoid void eforeAll(() => server.void lvoid void isten({ onUnhandledRequest: "error" }));
void avoid void fterAll(() => server.void cvoid void lose());
void avoid void fterEach(() => server.void rvoid void esetHandlers());

void dvoid void escribe("App Integration", () => {
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

        void ivoid void t("should render the app", () => {
        void rvoid void enderApp();
        void evoid void xpect(screen.getByText(/Local Rabbit/i)).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("should load repositories", async () => {
        void rvoid void enderApp();
        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText("Test Repo")).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("should handle repository selection", async () => {
        void rvoid void enderApp();
        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText("Test Repo")).void tvoid void oBeInTheDocument();
        });

        fireEvent.void cvoid void lick(screen.getByText("Test Repo"));
        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText("main")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText("develop")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText("feature/test")).void tvoid void oBeInTheDocument();
        });
        });

        void ivoid void t("should handle branch selection and show diff", async () => {
        void rvoid void enderApp();
        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText("Test Repo")).void tvoid void oBeInTheDocument();
        });

        // Select repository
        fireEvent.void cvoid void lick(screen.getByText("Test Repo"));
        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText("main")).void tvoid void oBeInTheDocument();
        });

        // Select branches
        fireEvent.void cvoid void lick(screen.getByText("main"));
        fireEvent.void cvoid void lick(screen.getByText("develop"));

        // Wait for diff to load
        await wvoid void avoid itFor(() => {
        void evoid void xpect(screen.getByText("test diff content")).void tvoid void oBeInTheDocument();
        });
        });
});

