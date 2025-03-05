/**
 * Performance Analyzer
 *
 * This utility demonstrates the performance benefits of using Lodash and Async
 * by comparing standard JavaScript operations with optimized versions.
 */

const _ = require('lodash');
const async = require('async');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '..', '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Logger setup
const log = {
  info: (message) => console.log(chalk.blue(message)),
  success: (message) => console.log(chalk.green(message)),
  error: (message) => console.log(chalk.red(message)),
  warn: (message) => console.log(chalk.yellow(message)),
  result: (message) => console.log(chalk.cyan(message)),
  header: (message) => console.log(chalk.bold.white(`\n=== ${message} ===`)),
};

/**
 * Run a performance test
 * @param {string} name - Test name
 * @param {Function} fn - Function to test
 * @param {number} iterations - Number of iterations
 * @returns {Object} Test results
 */
const runTest = async (name, fn, iterations = 1000) => {
  log.info(`Running test: ${name} (${iterations} iterations)`);

  const start = performance.now();
  const result = await fn(iterations);
  const end = performance.now();

  const duration = end - start;
  log.success(`Completed in ${duration.toFixed(2)}ms`);

  return {
    name,
    duration,
    iterations,
    opsPerSecond: (iterations / (duration / 1000)).toFixed(2),
    result,
  };
};

/**
 * Compare standard vs optimized implementations
 * @param {string} testName - Test name
 * @param {Function} standardFn - Standard implementation
 * @param {Function} optimizedFn - Optimized implementation
 * @param {number} iterations - Number of iterations
 */
const compareImplementations = async (testName, standardFn, optimizedFn, iterations = 1000) => {
  log.header(testName);

  const standardResult = await runTest(`Standard ${testName}`, standardFn, iterations);
  const optimizedResult = await runTest(`Optimized ${testName} (Lodash/Async)`, optimizedFn, iterations);

  const improvement = ((standardResult.duration - optimizedResult.duration) / standardResult.duration) * 100;

  log.result(`\nPerformance improvement: ${improvement.toFixed(2)}%`);
  log.result(`Standard: ${standardResult.opsPerSecond} ops/sec`);
  log.result(`Optimized: ${optimizedResult.opsPerSecond} ops/sec`);

  return {
    testName,
    standardResult,
    optimizedResult,
    improvement,
  };
};

// Test 1: Array Manipulation
const arrayManipulationTest = async () => {
  // Generate test data
  const generateArray = (size) => Array.from({ length: size }, (_, i) => ({
    id: i,
    value: Math.random() * 1000,
    name: `Item ${i}`,
    active: Math.random() > 0.5,
  }));

  const arraySize = 10000;
  const testArray = generateArray(arraySize);

  // Standard implementation
  const standardArrayManipulation = async (iterations) => {
    const results = [];

    for (let i = 0; i < iterations; i++) {
      // Filter, map, and sort operations
      const filtered = testArray.filter((item) => item.active);
      const mapped = filtered.map((item) => ({
        id: item.id,
        formattedValue: `$${item.value.toFixed(2)}`,
      }));
      const sorted = mapped.sort((a, b) => a.id - b.id);

      // Group by ranges
      const grouped = {};
      sorted.forEach((item) => {
        const range = Math.floor(item.id / 1000) * 1000;
        if (!grouped[range]) {
          grouped[range] = [];
        }
        grouped[range].push(item);
      });

      results.push(Object.keys(grouped).length);
    }

    return results.length;
  };

  // Optimized implementation with Lodash
  const optimizedArrayManipulation = async (iterations) => {
    const results = [];

    for (let i = 0; i < iterations; i++) {
      // Chained operations with Lodash
      const processed = _(testArray)
        .filter('active')
        .map((item) => ({
          id: item.id,
          formattedValue: `$${item.value.toFixed(2)}`,
        }))
        .sortBy('id')
        .groupBy((item) => Math.floor(item.id / 1000) * 1000)
        .value();

      results.push(Object.keys(processed).length);
    }

    return results.length;
  };

  return compareImplementations(
    'Array Manipulation',
    standardArrayManipulation,
    optimizedArrayManipulation,
    50, // Fewer iterations for this intensive test
  );
};

// Test 2: Parallel Processing
const parallelProcessingTest = async () => {
  // Simulate an async operation
  const simulateAsyncOperation = (id) => new Promise((resolve) => {
    const delay = Math.random() * 20; // Random delay up to 20ms
    setTimeout(() => {
      resolve({ id, processedAt: Date.now() });
    }, delay);
  });

  // Generate test data - IDs to process
  const items = Array.from({ length: 100 }, (_, i) => i);

  // Standard implementation - sequential processing
  const standardParallelProcessing = async () => {
    const results = [];

    for (const item of items) {
      const result = await simulateAsyncOperation(item);
      results.push(result);
    }

    return results.length;
  };

  // Optimized implementation with Async
  const optimizedParallelProcessing = async () => {
    const results = await async.mapLimit(
      items,
      10, // Concurrency limit
      async (item) => simulateAsyncOperation(item),
    );

    return results.length;
  };

  return compareImplementations(
    'Parallel Processing',
    standardParallelProcessing,
    optimizedParallelProcessing,
    5, // Fewer iterations due to the nature of the test
  );
};

// Test 3: Object Manipulation
const objectManipulationTest = async () => {
  // Generate test data
  const generateNestedObject = (depth, breadth) => {
    if (depth === 0) {
      return { value: Math.random() * 1000 };
    }

    const obj = {};
    for (let i = 0; i < breadth; i++) {
      obj[`prop${i}`] = generateNestedObject(depth - 1, breadth);
    }

    return obj;
  };

  const testObject = generateNestedObject(3, 5);

  // Standard implementation
  const standardObjectManipulation = async (iterations) => {
    const results = [];

    for (let i = 0; i < iterations; i++) {
      // Deep clone
      const cloned = JSON.parse(JSON.stringify(testObject));

      // Merge with another object
      const merged = {
        ...cloned,
        additionalProp: {
          name: 'test',
          values: [1, 2, 3],
        },
      };

      // Extract values
      const extractValues = (obj, result = []) => {
        if (obj.value !== undefined) {
          result.push(obj.value);
          return result;
        }

        Object.values(obj).forEach((val) => {
          if (typeof val === 'object') {
            extractValues(val, result);
          }
        });

        return result;
      };

      const values = extractValues(merged);
      results.push(values.length);
    }

    return results.length;
  };

  // Optimized implementation with Lodash
  const optimizedObjectManipulation = async (iterations) => {
    const results = [];

    for (let i = 0; i < iterations; i++) {
      // Deep clone with Lodash
      const cloned = _.cloneDeep(testObject);

      // Merge with Lodash
      const merged = _.merge({}, cloned, {
        additionalProp: {
          name: 'test',
          values: [1, 2, 3],
        },
      });

      // Extract values with Lodash
      const values = [];
      _.forEach(merged, function iterateValues(val) {
        if (_.has(val, 'value')) {
          values.push(val.value);
        } else if (_.isObject(val)) {
          _.forEach(val, iterateValues);
        }
      });

      results.push(values.length);
    }

    return results.length;
  };

  return compareImplementations(
    'Object Manipulation',
    standardObjectManipulation,
    optimizedObjectManipulation,
    100, // Fewer iterations for this intensive test
  );
};

// Run all tests and generate report
const runAllTests = async () => {
  log.header('PERFORMANCE ANALYSIS');
  log.info('Comparing standard JavaScript vs Lodash/Async optimized implementations\n');

  const results = [];

  try {
    results.push(await arrayManipulationTest());
    results.push(await parallelProcessingTest());
    results.push(await objectManipulationTest());

    // Generate summary
    log.header('SUMMARY');

    results.forEach((result) => {
      log.result(`${result.testName}: ${result.improvement.toFixed(2)}% improvement`);
    });

    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        averageImprovement: _.meanBy(results, 'improvement').toFixed(2),
        tests: results.length,
      },
    };

    fs.writeFileSync(
      path.join(reportsDir, 'performance-report.json'),
      JSON.stringify(report, null, 2),
    );

    log.success('\nPerformance report saved to reports/performance-report.json');
  } catch (error) {
    log.error(`Error running tests: ${error.message}`);
    console.error(error);
  }
};

// Execute if run directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runTest,
  compareImplementations,
  runAllTests,
};
