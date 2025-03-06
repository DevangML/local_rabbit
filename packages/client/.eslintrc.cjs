module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: null
  },
  settings: {
    react: {
      version: '18.2'
    },
  },
  plugins: ['react-refresh'],
  globals: {
    console: 'readonly',
    document: 'readonly',
    window: 'readonly',
    fetch: 'readonly',
    Promise: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    process: 'readonly',
    module: 'writable',
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
    'no-undef': 'warn',
    '@typescript-eslint/no-unused-vars': 'off'
  },
} 