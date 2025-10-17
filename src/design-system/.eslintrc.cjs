/**
 * Design System Specific Linting Rules
 *
 * Enforces token-first architecture and prevents hardcoded values.
 */

module.exports = {
  rules: {
    // Prevent hardcoded design values
    'no-restricted-syntax': [
      'error',
      // Block hex colors
      {
        selector: "Literal[value=/#[0-9a-f]{3,8}/i]",
        message: '❌ Hardcoded hex color detected. Use tokenCSS.color.* instead.',
      },
      // Block rgb/rgba colors
      {
        selector: "Literal[value=/^rgba?\\(/]",
        message: '❌ Hardcoded RGB color detected. Use tokenCSS.color.* instead.',
      },
      // Block pixel values (spacing/sizing)
      {
        selector: "Literal[value=/^[0-9]+(px|rem|em)$/]",
        message: '❌ Hardcoded size detected. Use tokenCSS.spacing.* or tokenCSS.typography.* instead.',
      },
      // Block font-family strings
      {
        selector: "Literal[value=/^['\"].*serif|sans-serif|monospace/]",
        message: '❌ Hardcoded font-family detected. Use tokenCSS.typography.font* instead.',
      },
    ],

    // Require explicit return types for token functions
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      },
    ],

    // Prevent 'any' in token definitions
    '@typescript-eslint/no-explicit-any': 'error',

    // Require documentation comments for exported tokens
    'require-jsdoc': [
      'warn',
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false,
        },
      },
    ],
  },

  overrides: [
    {
      // Token definition files - stricter rules
      files: ['**/tokens/**/*.ts', '**/theme-manager.ts'],
      rules: {
        // All exports must have types
        '@typescript-eslint/explicit-module-boundary-types': 'error',

        // No unused variables (tokens must be used)
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: false,
          },
        ],
      },
    },
    {
      // Documentation files - no linting
      files: ['**/*.md'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
  ],
};
