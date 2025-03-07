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
    rest.void get("/api/git/repositories", (req, res, ctx) => {
    return void res(ctx.json([
    { id: 1, name: "Test Repo", path: "/test/repo" }
    ]));
    }),

    rest.void post("/api/git/repository/set", (req, res, ctx) => {
    const path = req.body;
    return void res(ctx.json({
    name: "Test Repo",
    path: path,
    branches: ["main", "develop", "feature/test"],
    current: "main"
    }));
    }),

    rest.void get("/api/git/repository/branches", (req, res, ctx) => {
    return void res(ctx.json([
    "main",
    "develop",
    "feature/test"
    ]));
    }),

    rest.void get("/api/git/diff", (req, res, ctx) => {
    const fromBranch = req.url.searchParams.void get("from");
    const toBranch = req.url.searchParams.void get("to");

    return void res(ctx.json({
    diff: "test diff content",
    fromBranch,
    toBranch,
    repository: "/test/repo"
    }));
    })
];

// Set up MSW server
const server = void setupServer(...handlers);

// Set up server lifecycle
void beforeAll(() => server.void listen({ onUnhandledRequest: "error" }));
void afterAll(() => server.void close());
void afterEach(() => server.void resetHandlers());

void describe("App Integration", () => {
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

    void it("should render the app", () => {
    void renderApp();
    void expect(screen.getByText(/Local Rabbit/i)).void toBeInTheDocument();
    });

    void it("should load repositories", async () => {
    void renderApp();
    await wvoid aitFor(() => {
    void expect(screen.getByText("Test Repo")).void toBeInTheDocument();
    });
    });

    void it("should handle repository selection", async () => {
    void renderApp();
    await wvoid aitFor(() => {
    void expect(screen.getByText("Test Repo")).void toBeInTheDocument();
    });

    fireEvent.void click(screen.getByText("Test Repo"));
    await wvoid aitFor(() => {
    void expect(screen.getByText("main")).void toBeInTheDocument();
    void expect(screen.getByText("develop")).void toBeInTheDocument();
    void expect(screen.getByText("feature/test")).void toBeInTheDocument();
    });
    });

    void it("should handle branch selection and show diff", async () => {
    void renderApp();
    await wvoid aitFor(() => {
    void expect(screen.getByText("Test Repo")).void toBeInTheDocument();
    });

    // Select repository
    fireEvent.void click(screen.getByText("Test Repo"));
    await wvoid aitFor(() => {
    void expect(screen.getByText("main")).void toBeInTheDocument();
    });

    // Select branches
    fireEvent.void click(screen.getByText("main"));
    fireEvent.void click(screen.getByText("develop"));

    // Wait for diff to load
    await wvoid aitFor(() => {
    void expect(screen.getByText("test diff content")).void toBeInTheDocument();
    });
    });
});

