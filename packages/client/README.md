# Client Package

This package contains the client-side React application for Local Rabbit.

## Server-Side Rendering (SSR)

The application supports server-side rendering for improved performance and SEO.

### SSR Fix

There was an issue with the compiled `entry-server.js` file not properly exporting the `renderPage` function, which caused the server to throw an error:

```
SSR error: TypeError: renderPage is not a function
```

To fix this issue, we created a custom `entry-server-custom.js` file that properly exports the `renderPage` function and other required functions. This file is copied to the `dist/server/entry-server.js` location after the build process completes.

The fix is implemented in two ways:

1. **Manual Fix**: If you encounter the error, you can manually copy the custom file:
   ```bash
   cp packages/client/src/entry-server-custom.js packages/client/dist/server/entry-server.js
   ```

2. **Automatic Fix**: The `postbuild` script in `package.json` automatically copies the custom file after the build process completes.

### How It Works

The custom `entry-server-custom.js` file provides a minimal implementation of the required SSR functions:

- `renderPage`: Renders a React component for a given URL
- `renderToStream`: Supports streaming SSR (uses renderPage as a fallback)
- `extractCriticalToChunks`: Extracts critical CSS (placeholder implementation)
- `constructStyleTagsFromChunks`: Constructs style tags (placeholder implementation)

These functions are exported both as named exports and as a default export to ensure compatibility with different import styles. 