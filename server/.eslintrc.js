module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'plugin:node/recommended',
    'plugin:promise/recommended',
  ],
  plugins: [
    'security'
  ],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '**/*.spec.js'] }],
    'node/no-unsupported-features/es-syntax': ['error', { ignores: ['modules'] }],
    'max-len': ['error', { code: 100, ignoreComments: true, ignoreUrls: true }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-param-reassign': ['error', { props: false }],
    'promise/always-return': 'warn',
    'promise/catch-or-return': 'error',
    'node/no-unpublished-require': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'arrow-parens': ['error', 'always'],
    'arrow-body-style': ['error', 'as-needed'],
    'prefer-destructuring': 'error',
    'no-use-before-define': ['error', { functions: false, classes: true }],
    'object-curly-spacing': ['error', 'always'],
    'eol-last': ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    
    // Security rules
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-object-injection': 'off',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',
  },
}; 