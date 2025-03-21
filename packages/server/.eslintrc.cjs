module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:security/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['security'],
  settings: {
    'security': {
      'detect-unsafe-regex': true,
      'detect-buffer-noassert': true,
      'detect-child-process': true,
      'detect-disable-mustache-escape': true,
      'detect-eval-with-expression': true,
      'detect-no-csrf-before-method-override': true,
      'detect-non-literal-fs-filename': true,
      'detect-non-literal-regexp': true,
      'detect-non-literal-require': true,
      'detect-object-injection': true,
      'detect-possible-timing-attacks': true,
      'detect-pseudoRandomBytes': true,
    },
  },
  rules: {
    'no-console': ['warn', {
      allow: ['log', 'error', 'warn', 'info']
    }],
    'security/detect-object-injection': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',
    'consistent-return': 'error',
    'eqeqeq': ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
    'max-len': ['warn', {
      code: 100,
      ignoreComments: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'always'],
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
    },
  ],
}; 