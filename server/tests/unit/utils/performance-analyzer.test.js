const {
  describe, it, beforeEach, afterEach,
} = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');
const performanceAnalyzer = require('../../../src/utils/performance-analyzer');

describe('Performance Analyzer', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('should measure execution time accurately', async () => {
    const testFn = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return 'result';
    };

    const result = await performanceAnalyzer.runTest('test', testFn, 3);

    expect(result).to.have.property('name', 'test');
    expect(result).to.have.property('averageTime');
    expect(result).to.have.property('iterations', 3);
    expect(result.samples).to.be.an('array').with.length(3);
  });

  // Add more test cases...
});
