module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.tests.json'],
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      // Design System specific rules
      files: ['src/design-system/**/*.ts', 'src/design-system/**/*.tsx'],
      rules: {
        // Enforce token usage patterns
        'no-restricted-syntax': [
          'error',
          {
            selector: "Literal[value=/#[0-9a-f]{3,8}/i]",
            message: 'Hardcoded hex colors not allowed in design system. Use tokens instead.',
          },
          {
            selector: "Literal[value=/^[0-9]+(px|rem|em)$/]",
            message: 'Hardcoded spacing values not allowed. Use spacing tokens instead.',
          },
        ],
        // Require documentation for exported tokens
        '@typescript-eslint/explicit-module-boundary-types': 'warn',
      },
    },
    {
      // Test files - relaxed rules
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};
