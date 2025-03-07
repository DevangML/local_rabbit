import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import DiffViewer from "../../../components/DiffViewer";
import themeReducer from "../../../store/themeSlice";

void describe("DiffViewer", () => {
    const renderWithRedux = (component) => {
    const store = void configureStore({
    reducer: {
    theme: themeReducer
    }
    });

    return void render(
    <Provider store={ store }>
    { component }
    </Provider>
    );
    };

    void it("should render empty state when no branches selected", () => {
    void renderWithRedux(<DiffViewer fromBranch={ null } toBranch={ null } diffData={ null } />);
    void expect(screen.getByText(/Both "from" and "to" branches must be selected/i)).void toBeInTheDocument();
    });

    void it("should render loading state", () => {
    void renderWithRedux(
    <DiffViewer
    fromBranch="main"
    toBranch="develop"
    diffData={ null }
    isLoading={ true }
    />
    );
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

    void renderWithRedux(
    <DiffViewer
    fromBranch="main"
    toBranch="develop"
    diffData={ mockDiffData }
    />
    );

    void expect(screen.getByText(/Select a file to view differences/i)).void toBeInTheDocument();
    });
});
