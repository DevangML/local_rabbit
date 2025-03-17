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
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      version: '18.2'
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx']
      }
    }
  },
  plugins: ['react-refresh', 'react'],
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
    '*.config.js',
    'public/**',
    'coverage/**',
    'build/**',
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
    'no-unused-vars': ['warn', {
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_',
      'ignoreRestSiblings': true
    }],
    'no-undef': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': 'off',
    'react/no-array-index-key': 'off'
  },
  overrides: [
    {
      files: ['**/*.test.*', '**/*.spec.*', '**/tests/**'],
      env: {
        jest: true
      }
    }
  ]
}
