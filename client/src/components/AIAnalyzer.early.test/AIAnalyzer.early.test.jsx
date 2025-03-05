import React from 'react'
import AIAnalyzer from '../AIAnalyzer';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import "@testing-library/jest-dom";

describe('AIAnalyzer() AIAnalyzer method', () => {
  // Mock data for testing
  const mockDiffData = {
    files: [
      {
        path: 'example.js',
        chunks: [
          {
            newStart: 1,
            lines: [
              { type: 'addition', content: 'console.log("Hello World");' },
              { type: 'addition', content: 'setState({}); setState({});' },
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
  describe('Happy Path Tests', () => {
    test('should render the component with initial state', () => {
      // Render the component
      render(<AIAnalyzer diffData={mockDiffData} fromBranch="main" toBranch="feature" />);

      // Check if the component renders with initial state
      expect(screen.getByText('AI Code Analysis')).toBeInTheDocument();
      expect(screen.getByText('Analyze changes using pattern detection to identify potential issues')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Run Analysis/i })).toBeInTheDocument();
    });

    test('should display analysis results after running analysis', async () => {
      // Render the component
      render(<AIAnalyzer diffData={mockDiffData} fromBranch="main" toBranch="feature" />);

      // Click the "Run Analysis" button
      fireEvent.click(screen.getByRole('button', { name: /Run Analysis/i }));

      // Wait for the analysis to complete
      await waitFor(() => expect(screen.getByText(/Summary/i)).toBeInTheDocument());

      // Check if the analysis results are displayed
      expect(screen.getByText(/potential bugs were identified that need attention/i)).toBeInTheDocument();
      expect(screen.getByText(/Findings/i)).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Case Tests', () => {
    test('should handle empty diff data gracefully', async () => {
      // Render the component with empty diff data
      render(<AIAnalyzer diffData={emptyDiffData} fromBranch="main" toBranch="feature" />);

      // Click the "Run Analysis" button
      fireEvent.click(screen.getByRole('button', { name: /Run Analysis/i }));

      // Wait for the analysis to complete
      await waitFor(() => expect(screen.getByText(/Summary/i)).toBeInTheDocument());

      // Check if the summary indicates no files to analyze
      expect(screen.getByText(/No files to analyze/i)).toBeInTheDocument();
    });

    test('should handle non-text files gracefully', async () => {
      const nonTextDiffData = {
        files: [
          {
            path: 'image.png',
            chunks: [
              {
                newStart: 1,
                lines: [
                  { type: 'addition', content: 'binary data' },
                ],
              },
            ],
          },
        ],
      };

      // Render the component with non-text file data
      render(<AIAnalyzer diffData={nonTextDiffData} fromBranch="main" toBranch="feature" />);

      // Click the "Run Analysis" button
      fireEvent.click(screen.getByRole('button', { name: /Run Analysis/i }));

      // Wait for the analysis to complete
      await waitFor(() => expect(screen.getByText(/Summary/i)).toBeInTheDocument());

      // Check if the summary indicates no issues found
      expect(screen.getByText(/No issues found based on the analysis criteria/i)).toBeInTheDocument();
    });
  });
});