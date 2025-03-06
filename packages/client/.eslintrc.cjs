module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
    jest: true,
    worker: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  ignorePatterns: [
    'dist',
    '.eslintrc.js',
    '.eslintrc.cjs',
    'public/sw.js',
    'node_modules',
    'scripts',
    'build',
    'coverage',
    'vite.config.js',
    'vite.config.ts',
    '*.test.js',
    '*.test.jsx',
    '*.test.ts',
    '*.test.tsx',
    'tests'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  globals: {
    window: 'readonly',
    document: 'readonly',
    console: 'readonly',
    fetch: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    localStorage: 'readonly',
    URL: 'readonly',
    HTMLElement: 'readonly',
    process: 'readonly',
    __dirname: 'readonly',
    global: 'readonly',
    module: 'writable',
    require: 'readonly',
    exports: 'readonly',
    Event: 'readonly',
    FileReader: 'readonly',
    Blob: 'readonly',
    Worker: 'readonly',
    ImageData: 'readonly',
    Response: 'readonly',
    Image: 'readonly',
    File: 'readonly',
    performance: 'readonly',
    confirm: 'readonly',
    self: 'readonly',
    caches: 'readonly',
    describe: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    vi: 'readonly'
  },
  rules: {
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'no-undef': 'off'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx', '**/*.test.ts', '**/*.test.tsx'],
      env: {
        jest: true
      }
    },
    {
      files: ['**/scripts/**'],
      env: {
        node: true
      }
    }
  ]
}; 