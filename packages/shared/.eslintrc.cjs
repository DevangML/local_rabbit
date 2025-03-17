module.exports = {
  env: {
    browser: true,
    node: true,
    es2020: true
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '*.test.ts',
    '*.test.js',
    '**/*.d.ts'
  ],
  globals: {
    process: 'readonly',
    console: 'readonly',
    module: 'writable',
    require: 'readonly',
    exports: 'readonly'
  },
  rules: {
    'no-undef': 'error'
  }
}; 