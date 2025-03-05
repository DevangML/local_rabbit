# Deprecation Notice

## Overview

We have deprecated the old GitService implementation and projects.js routes in favor of the new SecureGitService implementation. This change ensures that the project is only used as a path reference for Git operations without storing or accessing project files.

## What Has Been Deprecated

1. **GitService**: The old GitService implementation has been deprecated in favor of the new SecureGitService.
2. **projects.js routes**: The old projects.js routes have been deprecated in favor of the new secureGitRoutes.js.

## Why We Made These Changes

The new SecureGitService implementation provides several benefits:

1. **Security**: The new implementation ensures that project files are never stored or accessed directly.
2. **Simplicity**: The new implementation is more focused and only performs Git operations that don't require accessing project files.
3. **Maintainability**: The new implementation is easier to maintain and extend.

## Migration Guide

### API Endpoints

For backward compatibility, the old API endpoints are still available but will be removed in a future release. We recommend updating your code to use the new endpoints:

| Old Endpoint | New Endpoint |
|--------------|--------------|
| `/api/repositories` | `/api/git/repositories` |
| `/api/repository/set` | `/api/git/repository/set` |
| `/api/repository/branches` | `/api/git/repository/branches` |
| `/api/diff` | `/api/git/diff` |

### Client-Side Code

If you're using the client-side code, you should update your API calls to use the new endpoints. For example:

```javascript
// Old
const response = await fetch(`${config.API_BASE_URL}/api/repositories`);

// New
const response = await fetch(`${config.API_BASE_URL}/api/git/repositories`);
```

## Timeline

The old implementation will be completely removed in a future release. We recommend migrating to the new implementation as soon as possible.

## More Information

For more information about the new SecureGitService implementation, please refer to the [SECURE_GIT_OPERATIONS.md](SECURE_GIT_OPERATIONS.md) file. 