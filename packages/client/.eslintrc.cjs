module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: '18.2'
    },
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  plugins: ['react-refresh', '@typescript-eslint', 'react'],
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    '*.config.js',
    '*.config.ts',
    'public/**',
    'coverage/**',
    'build/**',
    'vite.config.ts',
    '.eslintrc.cjs'
  ],
  globals: {
    // Browser globals
    window: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    console: 'readonly',
    fetch: 'readonly',
    localStorage: 'readonly',
    sessionStorage: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',

    // Web API globals
    URL: 'readonly',
    File: 'readonly',
    FileReader: 'readonly',
    Blob: 'readonly',
    Image: 'readonly',
    Event: 'readonly',
    HTMLElement: 'readonly',
    ImageData: 'readonly',
    Worker: 'readonly',
    Response: 'readonly',
    performance: 'readonly',

    // Node.js globals
    process: 'readonly',
    global: 'readonly',
    module: 'writable',
    require: 'readonly',
    __dirname: 'readonly',

    // Custom globals
    confirm: 'readonly',
    Promise: 'readonly'
  },
  rules: {
    'react-refresh/only-export-components': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', {
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }],
    'no-undef': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'off',
    'react/no-array-index-key': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-redeclare': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'off'
  },
  overrides: [
    {
      files: ['**/*.test.*', '**/*.spec.*', '**/tests/**'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off'
      }
    },
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off'
      }
    }
  ]
} 