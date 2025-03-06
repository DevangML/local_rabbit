module.exports = {
  env: {
    node: true,
    es2020: true,
    jest: true
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
    'coverage',
    'scripts',
    '*.test.ts',
    '*.test.js',
    'tests',
    'index.js',
    'jest.config.js',
    'routes/**',
    'server.js',
    'vite.config.ts',
    'src/services/GitService.js',
    'src/utils/validation.js'
  ],
  globals: {
    process: 'readonly',
    __dirname: 'readonly',
    module: 'writable',
    require: 'readonly',
    exports: 'readonly',
    console: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
    Buffer: 'readonly',
    global: 'readonly',
    describe: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    vi: 'readonly'
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-undef': 'warn',
    '@typescript-eslint/no-var-requires': 'off',
    'no-control-regex': 'off'
  },
  overrides: [
    {
      files: ['**/*.test.ts'],
      env: {
        jest: true
      }
    }
  ]
}; 