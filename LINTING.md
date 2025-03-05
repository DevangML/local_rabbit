# Real-Time VS Code Linting Integration

This project includes a powerful real-time linting setup that shows ESLint errors and warnings from both the client and server in VS Code's Problems tab as you type, similar to Flutter's development experience.

## How to Use

There are several ways to start the real-time linting:

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

### 3. Using the Command Line

You can also start the real-time linting directly from the command line:

```bash
./run.sh lint-vscode
```

## How It Works

The real-time linting process:

1. Uses nodemon to watch for file changes in both client and server code
2. Automatically runs ESLint when files are modified
3. Outputs the results in a format that VS Code can understand
4. Updates the Problems tab in real-time as you make changes to your code

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

## Troubleshooting

If you don't see linting errors updating in real-time:

1. Make sure you've started the linting task and it's still running
2. Check that the Problems tab is open (View > Problems)
3. Verify that ESLint is properly configured in both client and server directories
4. Check if nodemon is installed (it should be installed automatically)
5. Try restarting the linting task
6. Check the terminal output for any error messages 