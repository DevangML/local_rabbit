module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: null
  },
  settings: {
    react: {
      version: '18.2'
    }
  },
  plugins: ['react-refresh'],
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    '*.config.js',
    '*.config.ts',
    'public/**',
    'coverage/**',
    'build/**',
    '**/*.test.*',
    '**/*.spec.*'
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
    'no-unused-vars': ['warn', {
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }],
    'no-undef': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/no-array-index-key': 'off'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx', '**/tests/**'],
      env: {
        jest: true
      },
      globals: {
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        afterAll: 'readonly',
        beforeAll: 'readonly'
      }
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', {
          'varsIgnorePattern': '^_',
          'argsIgnorePattern': '^_',
          'ignoreRestSiblings': true
        }],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-inferrable-types': 'off'
      }
    }
  ]
} 