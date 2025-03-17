'use strict';

const Module = require('module');
const originalRequire = Module.prototype.require;

// Patch require to handle ES modules in CJS context
Module.prototype.require = function (...args) {
  try {
    return originalRequire.apply(this, args);
  } catch (err) {
    if (err.code === 'ERR_REQUIRE_ESM') {
      // Convert ESM to CJS on the fly
      const path = require('path');
      const importPath = path.resolve(path.dirname(this.filename), args[0]);
      return import(importPath);
    }
    throw err;
  }
};

module.exports = require('../entry-server.jsx');
