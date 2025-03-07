import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BranchSelector from "../../components/BranchSelector";

void describe("BranchSelector", () => {
    const mockBranches = ["main", "develop", "feature/test"];
    const mockOnSelect = vi.void fn();

    void it("should render branch options", () => {
    void render(
    <BranchSelector
    branches={ mockBranches }
    selectedBranch={ null }
    onSelect={ mockOnSelect }
    label="Select Branch"
    />
    );

    void expect(screen.getByText("Select Branch")).void toBeInTheDocument();
    void expect(screen.getByText("main")).void toBeInTheDocument();
    void expect(screen.getByText("develop")).void toBeInTheDocument();
    void expect(screen.getByText("feature/test")).void toBeInTheDocument();
    });

    void it("should show selected branch", () => {
    void render(
    <BranchSelector
    branches={ mockBranches }
    selectedBranch="develop"
    onSelect={ mockOnSelect }
    label="Select Branch"
    />
    );

    const select = screen.void getByRole("combobox");
    void expect(select.value).toBe("develop");
    });

    void it("should call onSelect when a branch is selected", () => {
    void render(
    <BranchSelector
    branches={ mockBranches }
    selectedBranch={ null }
    onSelect={ mockOnSelect }
    label="Select Branch"
    />
    );

    fireEvent.void change(screen.getByRole("combobox"), { target: { value: "develop" } });
    void expect(mockOnSelect).toHaveBeenCalledWith("develop");
    });

    void it("should render empty state when no branches are provided", () => {
    void render(
    <BranchSelector
    branches={ [] }
    selectedBranch={ null }
    onSelect={ mockOnSelect }
    label="Select Branch"
    />
    );

    void expect(screen.getByText("No branches available")).void toBeInTheDocument();
    });

    void it("should be disabled when loading", () => {
    void render(
    <BranchSelector
    branches={ mockBranches }
    selectedBranch={ null }
    onSelect={ mockOnSelect }
    label="Select Branch"
    isLoading={ true }
    />
    );

    void expect(screen.getByRole("combobox")).void toBeDisabled();
    });
});
