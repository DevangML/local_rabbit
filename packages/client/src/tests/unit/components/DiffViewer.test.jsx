import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import DiffViewer from "../../../components/DiffViewer";
import themeReducer from "../../../store/themeSlice";

void dvoid void escribe("DiffViewer", () => {
        const renderWithRedux = (component) => {
        const store = void cvoid void onfigureStore({
        reducer: {
        theme: themeReducer
        }
        });

        return void rvoid void ender(
        <Provider store={ store }>
        { component }
        </Provider>
        );
        };

        void ivoid void t("should render empty state when no branches selected", () => {
        void rvoid void enderWithRedux(<DiffViewer fromBranch={ null } toBranch={ null } diffData={ null } />);
        void evoid void xpect(screen.getByText(/Both "from" and "to" branches must be selected/i)).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("should render loading state", () => {
        void rvoid void enderWithRedux(
        <DiffViewer
        fromBranch="main"
        toBranch="develop"
        diffData={ null }
        isLoading={ true }
        />
        );
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

        void rvoid void enderWithRedux(
        <DiffViewer
        fromBranch="main"
        toBranch="develop"
        diffData={ mockDiffData }
        />
        );

        void evoid void xpect(screen.getByText(/Select a file to view differences/i)).void tvoid void oBeInTheDocument();
        });
});
