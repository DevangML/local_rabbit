# Local CodeRabbit Documentation 🐰

![Local CodeRabbit](https://via.placeholder.com/1200x300/4a6da7/ffffff?text=Local+CodeRabbit)

A comprehensive guide to understanding, installing, and using Local CodeRabbit - your local Git PR review tool.

## Table of Contents

- [Introduction](#introduction)
- [Installation Guide](#installation-guide)
- [Architecture Overview](#architecture-overview)
- [Feature Documentation](#feature-documentation)
  - [Diff Viewer](#diff-viewer)
  - [Impact Analyzer](#impact-analyzer)
  - [Quality Analyzer](#quality-analyzer)
  - [Code Reviewer](#code-reviewer)
- [Technical Implementation](#technical-implementation)
- [Developer Guide](#developer-guide)
- [Troubleshooting](#troubleshooting)

## Introduction

Local CodeRabbit is a powerful code review tool designed to work with local Git repositories. Unlike cloud-based review tools that require uploading your code to third-party servers, Local CodeRabbit runs entirely on your machine, providing privacy and security while offering advanced code analysis capabilities.

### Key Benefits

- **Privacy**: Works entirely locally - your code never leaves your machine
- **Performance**: Fast analysis without network latency
- **Comprehensive Analysis**: Multiple review modes for different aspects of code changes
- **Visual Diff**: Modern, clean interface for reviewing changes
- **Commenting System**: Add and track comments on specific lines

### Use Cases

- **Pre-commit Reviews**: Review your changes before committing
- **Pull Request/Merge Request Preparation**: Analyze impact and quality before creating a PR
- **Code Quality Monitoring**: Track how changes affect overall code quality
- **Team Collaboration**: Facilitate discussions around code changes locally
- **Open Source Contributions**: Review changes to external projects locally

## Installation Guide

### Prerequisites

- **Node.js**: v14.x or higher
- **npm** or **yarn**: Latest stable version
- **Git**: Must be installed and available in PATH

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/local-coderabbit.git
   cd local-coderabbit
   ```

2. **Install dependencies**:
   ```bash
   npm run install-all
   ```
   This command will install both server and client dependencies.

3. **Start the application**:
   ```bash
   npm start
   ```
   This will launch both the server (on port 3001) and the client application (on port 3000).

4. **Access the application**:
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Configuration

Local CodeRabbit stores repository paths and comments in memory during each session. No persistent configuration is needed, but if you'd like to customize your experience, consider:

- **ESLint Rules**: Modify the ESLint configuration in `server/analyzer.js` to match your project's coding standards
- **Complexity Thresholds**: Adjust impact and quality thresholds in the analyzer to fit your team's preferences

## Architecture Overview

Local CodeRabbit follows a client-server architecture:

```
┌─────────────────┐     HTTP     ┌─────────────────┐     Git     ┌─────────────────┐
│                 │   Requests   │                 │  Commands   │                 │
│  React Frontend ├──────────────►  Express Server ├──────────────► Git Repository  │
│                 │              │                 │             │                 │
└─────────────────┘              └─────────────────┘             └─────────────────┘
```

### Components

- **Frontend**: React application with React Router for navigation
- **Backend**: Node.js + Express server that:
  - Interacts with Git repositories using `simple-git`
  - Analyzes code using `jscodeshift`, `escomplex`, and `eslint`
  - Serves API endpoints for the frontend
- **State Management**: In-memory state on the server, React hooks on the client

## Feature Documentation

### Diff Viewer

The Diff Viewer is the core of Local CodeRabbit, providing a clear visual representation of changes between branches.

#### How It Works

1. **Diff Calculation**:
   - The Git diff between selected branches is generated using `simple-git`
   - The raw diff is parsed into a structured format with files, chunks, and line changes

2. **Visual Representation**:
   - Changed files are listed in the sidebar with addition/deletion counts
   - Selected file's changes are displayed with syntax highlighting
   - Additions appear with green background and "+" prefix
   - Deletions appear with red background and "-" prefix
   - Context lines appear with neutral background

3. **Commenting**:
   - Comments can be added to specific lines by entering the line number and comment text
   - Comments are stored in memory on the server and retrieved for each file

#### Implementation Details

- **Diff Parsing**: The `parseDiff` method in `GitService` converts raw Git diff output to a structured object
- **Line Numbering**: Correct line numbers are calculated for both old and new versions
- **File Selection**: The UI maintains state of the currently selected file
- **Comment Storage**: Comments are stored in a Map with file identifiers as keys

### Impact Analyzer

The Impact Analyzer evaluates how changes might affect the behavior and execution flow of your code.

#### Analysis Methodology

1. **Function Analysis**:
   - Identifies added, modified, and removed functions
   - Analyzes changes to function bodies and signatures
   - Highlights critical function changes that might affect calling code

2. **Variable Analysis**:
   - Detects added, modified, and removed variables
   - Tracks changes to variable values or types
   - Identifies potential side effects of variable changes

3. **Control Flow Analysis**:
   - Analyzes changes to conditional statements (if, switch)
   - Detects modifications to loops (for, while)
   - Identifies additions or removals of error handling (try/catch)

4. **Impact Scoring**:
   - Calculates an impact score based on a weighted algorithm:
     - Function changes are weighted higher than variable changes
     - Removal of code is weighted higher than additions (potentially breaking)
     - Control flow changes are given significant weight

#### Implementation Details

- **AST Parsing**: Uses `jscodeshift` to convert code to Abstract Syntax Trees
- **Tree Comparison**: Traverses and compares ASTs of old and new code versions
- **Scoring Algorithm**: Located in `calculateImpactLevel` method in `CodeAnalyzer`

### Quality Analyzer

The Quality Analyzer measures how changes affect code quality metrics and adherence to coding standards.

#### Quality Metrics

1. **Complexity Analysis**:
   - **Cyclomatic Complexity**: Measures the number of independent paths through the code
   - **Maintainability Index**: Composite metric indicating how maintainable the code is
   - **Halstead Complexity**: Measures of developer effort and potential for introducing bugs

2. **Linting Analysis**:
   - Uses ESLint to check both old and new code versions
   - Compares the number of errors and warnings before and after changes
   - Categorizes changes in linting results

3. **Quality Assessment**:
   - Combines metrics into a quality score
   - Provides a verdict: Improved, Reduced, or Unchanged
   - Highlights specific improvements or regressions

#### Implementation Details

- **Complexity Calculation**: Uses `escomplex` to generate complexity metrics
- **Linting**: Employs `eslint` with a configurable ruleset
- **Score Calculation**: Weighted algorithm in `assessQualityChange` method
- **Visualization**: Color-coded results with detailed breakdowns

### Code Reviewer

The Code Reviewer automatically generates suggestions and feedback on code changes.

#### Review Checks

1. **Code Smells**:
   - Detection of debugging artifacts (e.g., console.log statements)
   - Identification of unaddressed TODOs
   - Location of hardcoded values that should be constants

2. **Best Practices**:
   - File size warnings for growing files that might need refactoring
   - Detection of potential edge cases in code
   - Identification of common patterns that might indicate issues

3. **Comment Types**:
   - **Warning**: Issues that might cause problems in production
   - **Info**: General information and observations
   - **Suggestion**: Recommendations for improvement

#### Implementation Details

- **Pattern Detection**: Uses regex and AST analysis to identify patterns
- **Line Correlation**: Maps issues to specific line numbers for context
- **Presentation**: Issues are categorized and displayed alongside the diff

## Technical Implementation

### Server Components

1. **Git Service (`server/git.js`)**:
   - Provides an abstraction layer over Git operations
   - Methods for branch information, diff generation, file retrieval
   - Parsing logic for Git diff output

2. **Code Analyzer (`server/analyzer.js`)**:
   - Contains analysis logic for impact, quality, and review
   - Implements AST parsing and comparison
   - Calculates metrics and generates insights

3. **API Routes (`server/routes.js`)**:
   - Defines RESTful API endpoints
   - Handles repository management
   - Processes diff and analysis requests
   - Manages comments

### Client Components

1. **Main App (`client/src/App.js`)**:
   - Top-level component with routing
   - Repository selection UI
   - Branch selection controls

2. **DiffViewer (`client/src/components/DiffViewer.js`)**:
   - Displays file changes with syntax highlighting
   - Handles file selection and navigation
   - Manages the diff visualization

3. **AnalysisReport (`client/src/components/AnalysisReport.js`)**:
   - Renders impact and quality analysis
   - Toggles between different analysis modes
   - Visualizes metrics and assessments

4. **CommentsPanel (`client/src/components/CommentsPanel.js`)**:
   - UI for adding and managing comments
   - Displays comments per file
   - Handles comment creation and deletion

5. **ReviewPanel (`client/src/components/ReviewPanel.js`)**:
   - Shows automated review suggestions
   - Groups suggestions by file
   - Categorizes and prioritizes feedback

### Key Algorithms

1. **Diff Parsing Algorithm**:
   ```javascript
   parseDiff(diffText) {
     // Split diff into files, chunks, and lines
     // Categorize line changes (addition, deletion, context)
     // Calculate statistics (additions, deletions)
     // Return structured representation
   }
   ```

2. **Impact Analysis Algorithm**:
   ```javascript
   analyzeImpact(files, oldBranch, newBranch, gitService) {
     // For each file:
     //   Get old and new content
     //   Parse AST of both versions
     //   Detect function, variable, and flow changes
     //   Calculate impact score
     //   Categorize impact level
     // Return analysis results
   }
   ```

3. **Quality Scoring Algorithm**:
   ```javascript
   assessQualityChange(oldComplexity, newComplexity, oldLintResults, newLintResults) {
     // Calculate complexity differences
     // Compare linting results
     // Apply weights to different metrics
     // Calculate overall quality score
     // Return quality assessment
   }
   ```

## Developer Guide

### Project Structure

```
local-coderabbit/
├── package.json             # Main package configuration
├── server/                  # Backend code
│   ├── index.js             # Server entry point
│   ├── git.js               # Git operations
│   ├── analyzer.js          # Code analysis logic
│   └── routes.js            # API routes
└── client/                  # Frontend code
    ├── src/
    │   ├── App.js           # Main React component
    │   ├── components/      # UI components
    │   │   ├── DiffViewer.js
    │   │   ├── ReviewPanel.js
    │   │   ├── CommentsPanel.js
    │   │   └── AnalysisReport.js
```

### Extending Local CodeRabbit

1. **Adding a New Analysis Type**:
   - Create a new analysis method in `CodeAnalyzer` class
   - Add corresponding API endpoint in `routes.js`
   - Create UI component for displaying results
   - Add navigation link in main app

2. **Supporting Additional Languages**:
   - Extend file extension checks in analysis methods
   - Add language-specific parsing logic
   - Integrate with appropriate AST parsers for the language
   - Update UI to handle language-specific features

3. **Enhancing the Diff Viewer**:
   - Modifications to `parseDiff` method for advanced diff features
   - UI updates in `DiffViewer.js` component
   - Style adjustments in `DiffViewer.css`

### API Reference

1. **Repository Management**:
   - `POST /api/set-repo`: Set the current repository path
   - `GET /api/repo-info`: Get information about the current repository

2. **Diff Operations**:
   - `GET /api/diff`: Get diff between two branches

3. **Analysis Endpoints**:
   - `GET /api/analyze/impact`: Run impact analysis
   - `GET /api/analyze/quality`: Run quality analysis
   - `GET /api/analyze/review`: Run code review

4. **Comment Management**:
   - `GET /api/comments/:fileId`: Get comments for a file
   - `POST /api/comments/:fileId`: Add a comment
   - `DELETE /api/comments/:fileId/:commentId`: Delete a comment

## Troubleshooting

### Common Issues

1. **Repository Not Found**:
   - Ensure the path to the Git repository is correct
   - Verify that the `.git` directory exists in the specified path
   - Check file permissions for the repository directory

2. **Analysis Errors**:
   - Check if files are valid JavaScript/JSX
   - Ensure ESLint configuration is compatible with your code
   - Look for syntax errors that might prevent AST parsing

3. **Diff Display Issues**:
   - Verify that Git diff is working correctly in terminal
   - Check for very large files that might cause performance issues
   - Ensure branches exist and have been properly fetched

### Debugging Tips

1. **Server Logs**:
   - Check the terminal where the server is running for error messages
   - Look for failed Git commands or analysis errors

2. **Client Console**:
   - Open browser developer tools to check for JavaScript errors
   - Inspect network requests to see API responses

3. **Manual Testing**:
   - Try running Git commands manually to verify behavior
   - Compare analysis results with manual code inspection

---

<p align="center">
  <b>Local CodeRabbit</b><br>
  Making code reviews better, one hop at a time 🐇
</p>