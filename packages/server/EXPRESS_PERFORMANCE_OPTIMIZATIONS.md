# Express.js Performance Optimizations

This document outlines the performance optimizations implemented in the Local CodeRabbit Server based on the [Express.js Performance Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html).

## Table of Contents

- [Implemented Optimizations](#implemented-optimizations)
  - [Use gzip compression](#use-gzip-compression)
  - [Don't use synchronous functions](#dont-use-synchronous-functions)
  - [Use middleware to serve static files](#use-middleware-to-serve-static-files)
  - [Do proper error handling](#do-proper-error-handling)
  - [Set NODE_ENV to "production"](#set-node_env-to-production)
  - [Ensure your app automatically restarts](#ensure-your-app-automatically-restarts)
  - [Run your app in a cluster](#run-your-app-in-a-cluster)
  - [Cache request results](#cache-request-results)
  - [Use a load balancer](#use-a-load-balancer)
  - [Use a reverse proxy](#use-a-reverse-proxy)
- [Additional Optimizations](#additional-optimizations)
  - [Rate Limiting](#rate-limiting)
  - [Disable ETag](#disable-etag)
  - [Reduce JSON Payload Size](#reduce-json-payload-size)
  - [Optimize Logger](#optimize-logger)

## Implemented Optimizations

### Use gzip compression

We've implemented gzip compression using the `compression` middleware with custom configuration:

```javascript
const compressionMiddleware = compression({
  threshold: 1024,  // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6  // Balanced compression level
});
```

### Don't use synchronous functions

We've ensured that all I/O operations are performed asynchronously to avoid blocking the event loop.

### Use middleware to serve static files

We've configured the static file middleware with proper caching:

```javascript
app.use('/static', express.static(staticPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: false,
  lastModified: false
}));
```

### Do proper error handling

We've implemented comprehensive error handling:

1. Custom error handler middleware
2. Unhandled rejection handler
3. Uncaught exception handler
4. Graceful shutdown on SIGTERM

### Set NODE_ENV to "production"

We've configured the application to use different settings based on the NODE_ENV:

```javascript
if (process.env.NODE_ENV === 'production') {
  // Production-specific settings
}
```

### Ensure your app automatically restarts

In production, we use a process manager (PM2) to ensure the application restarts automatically if it crashes.

### Run your app in a cluster

We've implemented clustering to utilize all available CPU cores in production:

```javascript
if (shouldUseCluster && cluster.isMaster) {
  const numCPUs = os.cpus().length;
  // Fork workers for each CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  // Restart workers if they die
  cluster.on('exit', (worker) => {
    cluster.fork();
  });
}
```

### Cache request results

We've implemented cache control headers for static assets:

```javascript
const cacheControlMiddleware = (maxAge = 86400) => (req, res, next) => {
  if (req.path.startsWith('/api/') || req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store');
  } else {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  }
  next();
};
```

### Use a load balancer

For production deployments, we recommend using a load balancer like Nginx or HAProxy in front of the application.

### Use a reverse proxy

In production, we recommend using Nginx as a reverse proxy in front of the Express application.

## Additional Optimizations

### Rate Limiting

We've implemented rate limiting to protect against abuse:

```javascript
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
}));
```

### Disable ETag

We've disabled ETags to reduce unnecessary validation requests:

```javascript
app.use(disableETagMiddleware);
```

### Reduce JSON Payload Size

We've reduced the maximum JSON payload size from 50MB to 10MB for better performance:

```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### Optimize Logger

We've configured the logger to skip logging static asset requests in production:

```javascript
app.use(morgan(morganFormat, {
  // ...
  skip: (req) => process.env.NODE_ENV === 'production' && req.url.startsWith('/static')
}));
``` 