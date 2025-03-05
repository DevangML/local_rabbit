module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'plugin:node/recommended',
  ],
  plugins: [
    'security',
    'node',
    'promise',
  ],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    'max-len': ['error', { code: 100, ignoreStrings: true }],
    'no-console': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'security/detect-non-literal-fs-filename': 'warn',
    'node/no-unsupported-features/es-syntax': ['error', {
      version: '>=14.0.0',
      ignores: [],
    }],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: ['**/*.test.js', '**/*.spec.js', 'tests/**/*'],
    }],
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      rules: {
        'no-unused-expressions': 'off',
      },
    },
  ],
};
