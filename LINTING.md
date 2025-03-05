# Real-Time VS Code Linting Integration

This project includes a powerful real-time linting setup that shows ESLint errors and warnings from both the client and server in VS Code's Problems tab as you type, similar to Flutter's development experience.

## Prerequisites

- Node.js version 18 or higher (as specified in the `.nvmrc` file)
- NVM (Node Version Manager) is recommended for managing Node.js versions
- VS Code ESLint extension (recommended for the best experience)

The linting script will automatically attempt to use the correct Node.js version if NVM is installed.

## Recommended Approach: Using VS Code ESLint Extension

For the best real-time linting experience, we recommend using the VS Code ESLint extension:

1. Install the ESLint extension for VS Code
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
   - Search for "ESLint" and install the extension by Microsoft

2. The project is already configured with `.vscode/settings.json` to work with both client and server code
   - Linting will happen automatically as you type or save files
   - Errors and warnings will appear in the Problems tab
   - You can also see inline errors and warnings in your code

## Alternative Approaches

### 1. Using VS Code Tasks

1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) to open the Command Palette
2. Type "Tasks: Run Task" and select it
3. Choose "Run ESLint (Watch Mode)" from the list of tasks

This will start ESLint in watch mode for both the client and server code. Any errors or warnings will appear in the Problems tab in real-time as you edit your code.

### 2. Start Development with Linting

For a complete development environment with linting:

1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) to open the Command Palette
2. Type "Tasks: Run Task" and select it
3. Choose "Start Development with Linting" from the list of tasks

This will start both the client and server development servers along with the real-time linting.

### 3. One-Time Linting

To run a one-time lint of the entire project:

1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) to open the Command Palette
2. Type "Tasks: Run Task" and select it
3. Choose "Lint Whole Project" from the list of tasks

### 4. Using the Command Line

You can also start the real-time linting directly from the command line:

```bash
# First ensure you're using the correct Node.js version
nvm use 18  # Or just 'nvm use' if you have .nvmrc

# Then run the linting script
./run.sh lint-vscode
```

## How It Works

The real-time linting process:

1. Ensures the correct Node.js version is being used (via NVM if available)
2. Uses nodemon to watch for file changes in both client and server code
3. Automatically runs ESLint when files are modified
4. Outputs the results in a format that VS Code can understand
5. Updates the Problems tab in real-time as you make changes to your code

## Benefits

- **Real-time feedback**: See linting errors and warnings as you type
- **Unified view**: Both client and server issues appear in the same Problems tab
- **Improved productivity**: Fix issues immediately rather than waiting for a build or manual lint run
- **Better code quality**: Encourages fixing issues as they arise
- **Integrated workflow**: Can run alongside development servers

## Stopping the Linting Process

To stop the real-time linting:

1. Find the terminal where the linting task is running
2. Press `Ctrl+C` to stop the process

## Customizing

If you need to customize the linting behavior:

1. Edit the `run_lint_for_vscode` function in `run.sh` to modify the linting commands or file watching patterns
2. Edit the `Run ESLint (Watch Mode)` task in `.vscode/tasks.json` to modify how VS Code processes the results
3. Modify the `.vscode/settings.json` file to change ESLint extension settings

## Troubleshooting

If you don't see linting errors updating in real-time:

1. Make sure you've installed the ESLint extension for VS Code
2. Check that the Problems tab is open (View > Problems)
3. Verify that ESLint is properly configured in both client and server directories
4. Try reloading the VS Code window (Cmd+Shift+P or Ctrl+Shift+P, then "Developer: Reload Window")
5. Check if nodemon is installed (it should be installed automatically)
6. Try restarting the linting task
7. Check the terminal output for any error messages

### Node.js Version Issues

If you see errors like:

```
error local_rabbit_server@1.0.0: The engine "node" is incompatible with this module. Expected version ">=18.0.0". Got "14.17.3"
```

This means you're using an incompatible Node.js version. To fix this:

1. Install Node.js 18 using NVM: `nvm install 18`
2. Set it as your default: `nvm alias default 18`
3. Or just use it for this project: `nvm use 18`

The linting script will attempt to switch to the correct Node.js version automatically if NVM is available. 