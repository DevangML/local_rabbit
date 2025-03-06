# Test Suite for Local CodeRabbit Client

This directory contains the test suite for the Local CodeRabbit client application. The tests are written using Vitest and React Testing Library.

## Test Structure

The tests are organized to mirror the structure of the source code:

```
tests/
├── components/       # Tests for React components
├── utils/            # Tests for utility functions
├── services/         # Tests for services
├── store/            # Tests for Redux store
├── hooks/            # Tests for custom hooks
├── integration/      # Integration tests
├── unit/             # Unit tests
├── setup.js          # Test setup file
├── run-all-tests.js  # Script to run all tests with coverage
└── README.md         # This file
```

## Running Tests

You can run the tests using the following npm scripts:

```bash
# Run tests in watch mode (development)
npm run test:watch

# Run tests once
npm run test

# Run tests with coverage
npm run test:coverage

# Run all tests with coverage and generate reports
npm run test:all
```

## Coverage Reports

Coverage reports are generated in the `reports/coverage` directory. You can view the HTML report by opening `reports/coverage/index.html` in your browser.

## Adding New Tests

When adding new tests, follow these guidelines:

1. Create test files with the `.test.jsx` or `.test.js` extension
2. Place test files in the appropriate directory that mirrors the source code structure
3. Use descriptive test names that clearly indicate what is being tested
4. Mock external dependencies to isolate the code being tested
5. Aim for 100% code coverage

### Example Test Structure

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import YourComponent from '../../components/YourComponent';

describe('YourComponent', () => {
  beforeEach(() => {
    // Setup code
  });

  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    // Test user interaction
  });
});
```

## Mocking

The test setup includes mocks for:

- localStorage
- sessionStorage
- fetch API
- IntersectionObserver
- ResizeObserver
- matchMedia

If you need to mock additional browser APIs or external dependencies, add them to the `setup.js` file.

## Troubleshooting

If you encounter issues with the tests:

1. Check that all dependencies are installed
2. Verify that the component being tested is correctly imported
3. Ensure that all required props are provided to components
4. Check for any console errors during test execution
5. Try running the tests with `--no-threads` option if you suspect concurrency issues

## Continuous Integration

These tests are run as part of the CI pipeline. All tests must pass before code can be merged to the main branch. 