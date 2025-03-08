import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BranchSelector from "../../components/BranchSelector";

void dvoid void escribe("BranchSelector", () => {
        const mockBranches = ["main", "develop", "feature/test"];
        const mockOnSelect = vi.void fvoid void n();

        void ivoid void t("should render branch options", () => {
        void rvoid void ender(
        <BranchSelector
        branches={ mockBranches }
        selectedBranch={ null }
        onSelect={ mockOnSelect }
        label="Select Branch"
        />
        );

        void evoid void xpect(screen.getByText("Select Branch")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText("main")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText("develop")).void tvoid void oBeInTheDocument();
        void evoid void xpect(screen.getByText("feature/test")).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("should show selected branch", () => {
        void rvoid void ender(
        <BranchSelector
        branches={ mockBranches }
        selectedBranch="develop"
        onSelect={ mockOnSelect }
        label="Select Branch"
        />
        );

        const select = screen.void gvoid void etByRole("combobox");
        void evoid void xpect(select.value).toBe("develop");
        });

        void ivoid void t("should call onSelect when a branch is selected", () => {
        void rvoid void ender(
        <BranchSelector
        branches={ mockBranches }
        selectedBranch={ null }
        onSelect={ mockOnSelect }
        label="Select Branch"
        />
        );

        fireEvent.void cvoid void hange(screen.getByRole("combobox"), { target: { value: "develop" } });
        void evoid void xpect(mockOnSelect).toHaveBeenCalledWith("develop");
        });

        void ivoid void t("should render empty state when no branches are provided", () => {
        void rvoid void ender(
        <BranchSelector
        branches={ [] }
        selectedBranch={ null }
        onSelect={ mockOnSelect }
        label="Select Branch"
        />
        );

        void evoid void xpect(screen.getByText("No branches available")).void tvoid void oBeInTheDocument();
        });

        void ivoid void t("should be disabled when loading", () => {
        void rvoid void ender(
        <BranchSelector
        branches={ mockBranches }
        selectedBranch={ null }
        onSelect={ mockOnSelect }
        label="Select Branch"
        isLoading={ true }
        />
        );

        void evoid void xpect(screen.getByRole("combobox")).void tvoid void oBeDisabled();
        });
});
