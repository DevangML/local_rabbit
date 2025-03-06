module.exports = {
  env: {
    browser: true,
    node: true,
    es2020: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: null
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: [
    'dist',
    'node_modules',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '*.test.ts',
    '*.test.js'
  ],
  globals: {
    process: 'readonly',
    console: 'readonly',
    module: 'writable',
    require: 'readonly',
    exports: 'readonly'
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-undef': 'warn',
    '@typescript-eslint/no-unused-expressions': 'off'
  }
}; 