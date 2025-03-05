# Secure Git Operations

This document explains how the application handles Git operations securely, ensuring that project files are never stored or accessed directly.

## Overview

The application uses Git repositories solely as path references for Git operations. It only:

1. Checks if a directory is a valid Git repository
2. Lists branches in a repository
3. Generates diffs between branches

The application **never**:
- Reads project files
- Stores project files
- Accesses project contents in any way

## Implementation Details

### SecureGitService

The `SecureGitService` is the core component that ensures secure Git operations:

- It only stores the path to the Git repository
- It uses the `simple-git` library to perform Git operations
- It validates paths to ensure they are within allowed directories
- It only performs Git operations that don't require accessing project files

### API Endpoints

The application provides the following secure Git API endpoints:

1. `/api/git/repositories` - Lists available Git repositories
2. `/api/git/repository/set` - Sets the current repository path
3. `/api/git/repository/branches` - Lists branches in the current repository
4. `/api/git/diff` - Generates a diff between two branches

For backward compatibility, the following legacy endpoints are also supported but will be removed in a future release:

1. `/api/repositories` - Lists available Git repositories
2. `/api/repository/set` - Sets the current repository path
3. `/api/repository/branches` - Lists branches in the current repository
4. `/api/diff` - Generates a diff between two branches

### Path Validation

All paths are validated to ensure they are:

- Within allowed directories (e.g., Documents, Projects, etc.)
- Free from path traversal attempts (e.g., `../`)
- Valid Git repositories

### Security Measures

The application implements several security measures:

1. **Path Whitelisting**: Only paths within specific directories are allowed
2. **Path Traversal Prevention**: Paths containing `..` are rejected
3. **Git Operation Limitation**: Only Git operations that don't require file access are allowed
4. **No File Storage**: Project files are never stored or cached

## How It Works

1. The user selects a Git repository from a list of available repositories
2. The application verifies it's a valid Git repository using `git.checkIsRepo()`
3. The application lists branches using `git.branchLocal()`
4. When the user selects two branches, the application generates a diff using `git.diff()`

All these operations use Git commands directly and don't require accessing or storing project files.

## Technical Implementation

The implementation uses:

- `simple-git` for Git operations
- Path validation to ensure security
- Express.js for API endpoints
- React for the frontend

## Deprecation Notice

The old GitService implementation and projects.js routes have been deprecated in favor of the new SecureGitService implementation. For more information about the deprecation, please refer to the [DEPRECATION_NOTICE.md](DEPRECATION_NOTICE.md) file.

## Conclusion

This approach ensures that the application only uses Git repositories as path references and never accesses or stores project files directly. It provides a secure way to analyze Git repositories without compromising the security of the project files.