# Local CodeRabbit 🐰

![Local CodeRabbit Banner](https://via.placeholder.com/1200x300/4a6da7/ffffff?text=Local+CodeRabbit)

A powerful PR review tool for local Git repositories, inspired by AI-powered services, but running entirely on your local machine. Review code changes, analyze impact, evaluate quality, and collaborate effectively—all without uploading your code to external services.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Setting Up Repository](#setting-up-repository)
  - [Diff Viewer](#diff-viewer)
  - [Impact Analyzer](#impact-analyzer)
  - [Quality Analyzer](#quality-analyzer)
  - [Code Reviewer](#code-reviewer)
- [Technical Architecture](#technical-architecture)
- [Contributing](#contributing)

## ✨ Features

Local CodeRabbit provides a comprehensive suite of tools for reviewing pull requests in local Git repositories:

### 🔍 Diff Viewer
- View file changes with syntax highlighting
- Side-by-side diff comparison
- Add line-specific comments
- Track changes between branches

### 📊 Impact Analyzer
Understand how changes affect your codebase:
- Function changes detection (added, modified, removed)
- Variable changes tracking
- Control flow impact analysis (conditionals, loops, error handling)
- Impact level assessment (Low, Medium, High)

### 🏆 Quality Analyzer
Evaluate code quality changes:
- Complexity metrics (cyclomatic complexity, maintainability index)
- Code style analysis using ESLint
- Before/after quality comparison
- Quality trend assessment (Improved, Reduced, Unchanged)

### 👨‍💻 Code Reviewer
Automated code review suggestions:
- Detects potential issues (console.log statements, TODOs)
- Identifies hardcoded values
- Flags large files that might need refactoring
- Provides contextual improvement suggestions

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/yourusername/local-coderabbit.git
cd local-coderabbit
```

2. Install dependencies:

```bash
npm run install-all
```

3. Start the application:

```bash
npm start
```

This will launch both the server and client applications. The web interface will be available at [http://localhost:3000](http://localhost:3000).

## 💻 Usage

### Setting Up Repository

1. When you first open Local CodeRabbit, you'll be prompted to enter the path to your Git repository:

![Repository Setup](https://via.placeholder.com/800x400/ffffff/333333?text=Repository+Setup+Screen)

2. Enter the absolute path to your Git repository and click "Set Repository"
3. Once connected, you'll see a list of branches in your repository
4. Select the base branch and compare branch to begin code review

### Diff Viewer

The Diff Viewer provides a visual representation of changes between branches:

![Diff Viewer](https://via.placeholder.com/800x400/ffffff/333333?text=Diff+Viewer+Screen)

#### Features:
- Left panel displays a list of changed files with additions and deletions count
- Main panel shows the specific changes in the selected file
- Color coding: green for additions, red for deletions
- Line numbers for easy reference
- Comments panel for adding line-specific feedback

#### To use:
1. Select a file from the left panel
2. Review changes in the main panel
3. Add comments by specifying a line number and your feedback
4. Comments are saved locally and persist during your session

### Impact Analyzer

The Impact Analyzer evaluates how changes might affect the behavior of your code:

![Impact Analyzer](https://via.placeholder.com/800x400/ffffff/333333?text=Impact+Analyzer+Screen)

#### Analysis includes:
- **Function Changes**: Detects added, modified, and removed functions
- **Variable Changes**: Tracks variables that have been added, modified, or removed
- **Flow Changes**: Analyzes changes in control flow (if statements, loops, etc.)
- **Impact Level**: Provides an overall impact assessment (Low, Medium, High)

#### How it works:
1. The analyzer first obtains the diff between branches
2. For each JavaScript/JSX file, it extracts the structure using AST (Abstract Syntax Tree) parsing
3. It compares the structures of the old and new code to identify changes
4. An impact score is calculated based on the significance of changes
5. Results are categorized and presented visually

### Quality Analyzer

The Quality Analyzer measures how changes affect code quality:

![Quality Analyzer](https://via.placeholder.com/800x400/ffffff/333333?text=Quality+Analyzer+Screen)

#### Metrics analyzed:
- **Complexity Metrics**: Changes in cyclomatic complexity, maintainability index, and Halstead difficulty
- **Linting Results**: Comparison of ESLint errors and warnings before and after
- **Overall Assessment**: Evaluation of whether quality improved, reduced, or remained unchanged

#### How it works:
1. The analyzer runs code complexity tools on both the old and new versions of each file
2. It calculates the difference in various metrics
3. ESLint is used to detect potential issues in both versions
4. A quality score is calculated based on changes in complexity and linting results
5. Results are presented with color-coded indicators (green for improvements, red for regressions)

### Code Reviewer

The Code Reviewer provides automatic feedback on your changes:

![Code Reviewer](https://via.placeholder.com/800x400/ffffff/333333?text=Code+Reviewer+Screen)

#### Types of suggestions:
- **Warning**: Potential issues that might affect production (e.g., console.log statements)
- **Info**: Informational notes (e.g., TODO comments found)
- **Suggestion**: Improvement recommendations (e.g., extract hardcoded values)

#### How it works:
1. The reviewer analyzes each changed file looking for common patterns
2. It generates comments based on detected patterns
3. Comments are categorized by type and associated with specific lines
4. The diff view is presented alongside suggestions for context

## 🏗 Technical Architecture

Local CodeRabbit is built with a modern JavaScript stack:

### Backend (Node.js + Express)
- **Git Integration**: Uses `simple-git` to interact with local Git repositories
- **Code Analysis**: Employs `jscodeshift` for AST manipulation, `escomplex` for complexity metrics, and `eslint` for style checking
- **API Layer**: RESTful API built with Express.js

### Frontend (React)
- **UI Framework**: React with React Router for navigation
- **State Management**: React hooks for component state
- **Styling**: CSS with flexbox and grid for layout

### Data Flow
1. Server reads Git repository information and exposes it via API
2. React frontend requests repository data and displays branches
3. User selects branches to compare
4. Server performs diffs, analysis, and review
5. Frontend displays results in specialized views
6. Comments are stored in-memory on the server during session

## 📝 Implementation Details

### Diff Generation
The system uses Git's diff capabilities to generate a structured diff representation:
1. `git diff` command is executed between branches
2. The raw diff output is parsed into a structured format
3. Chunks, lines, and changes are categorized for rendering

### AST Analysis
Abstract Syntax Tree analysis powers the impact and quality analysis:
1. Code is parsed into an AST using `jscodeshift`
2. Tree traversal identifies functions, variables, and control flow
3. Before and after trees are compared to detect changes
4. Changes are categorized and quantified

### Quality Scoring
Quality assessment uses a weighted scoring system:
- Decreased complexity: +2 points
- Increased maintainability: +3 points
- Reduced ESLint errors: +3 points
- Reduced ESLint warnings: +1 point

The final assessment is determined by the total score:
- Score > 3: Quality Improved
- Score < -3: Quality Reduced
- Otherwise: Quality Unchanged

## 🤝 Contributing

Contributions to Local CodeRabbit are welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Built with ❤️ for developers who care about code quality
</p>