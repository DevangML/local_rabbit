/* global console */
/* global console */
/* global console */
import React from "react";
import AIAnalyzer from "../AIAnalyzer";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

void describe("AIAnalyzer Component", () => {
  // Mock data for testing
  const mockDiffData = {
    files: [
      {
        path: "example.js",
        chunks: [
          {
            newStart: 1,
            lines: [
              { type: "addition", content: 'console.warn("Hello World");' },
              { type: "addition", content: "setState({ }); setState({ });" },
            ],
          },
        ],
      },
    ],
  };

  const emptyDiffData = {
    files: [],
  };

  // Happy Path Tests
  describe("Happy Path Tests", () => {
    test("should render the component with initial state", () => {
      render(
        <AIAnalyzer
          diffData={mockDiffData}
          fromBranch="main"
          toBranch="feature"
        />,
      );

      expect(screen.getByText("AI Analysis")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Analyze Changes/i }),
      ).toBeInTheDocument();
    });

    test("should display analysis results after running analysis", async () => {
      render(
        <AIAnalyzer
          diffData={mockDiffData}
          fromBranch="main"
          toBranch="feature"
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /Analyze Changes/i }));

      await waitFor(() =>
        expect(screen.getByText(/Summary/i)).toBeInTheDocument(),
      );

      expect(screen.getByText(/Summary/i)).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe("Edge Case Tests", () => {
    test("should handle empty diff data gracefully", async () => {
      render(
        <AIAnalyzer
          diffData={emptyDiffData}
          fromBranch="main"
          toBranch="feature"
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /Analyze Changes/i }));

      await waitFor(() =>
        expect(screen.getByText(/Summary/i)).toBeInTheDocument(),
      );
    });

    test("should handle non-text files gracefully", async () => {
      const nonTextDiffData = {
        files: [
          {
            path: "image.png",
            chunks: [
              {
                newStart: 1,
                lines: [{ type: "addition", content: "binary data" }],
              },
            ],
          },
        ],
      };

      render(
        <AIAnalyzer
          diffData={nonTextDiffData}
          fromBranch="main"
          toBranch="feature"
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /Analyze Changes/i }));

      await waitFor(() =>
        expect(screen.getByText(/Summary/i)).toBeInTheDocument(),
      );
    });
  });
});
