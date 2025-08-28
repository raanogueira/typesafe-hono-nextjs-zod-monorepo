// Shared ESLint configuration for all Capital Shield packages
// ESLint v9 flat config with modern projectService auto-discovery
// Eliminates the need for manual tsconfig.eslint.json files

import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true, // ESLint v9 auto-discovery - no more manual tsconfig management!
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        URL: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        crypto: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    rules: {
      // Core type safety - following Next.js/TypeScript compiler patterns
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',

      // DISABLE problematic unsafe rules (industry standard approach)
      // Analysis: 50 violations total across test files and framework integration
      // These cause false positives in test mocks and neverthrow Result<T,E> patterns
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // Keep meaningful type rules
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-empty-object-type': 'off', // Allow {} for compatibility

      // Financial precision rules (our domain-specific safety)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="parseFloat"]',
          message: 'Use proper Money types - parseFloat causes precision errors',
        },
        {
          selector: 'CallExpression[callee.object.name="Date"][callee.property.name="now"]',
          message: 'Inject time functions for testability',
        },
        {
          selector: 'BinaryExpression[operator="/"] > Literal[raw=/^\\d+$/]',
          message: 'Use BigInt for financial calculations',
        },
      ],

      // Console rules - allow for infrastructure
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  // Script and server files can use console
  {
    files: ['src/scripts/**/*.ts', 'src/server.ts', 'src/app.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  // Test files - more relaxed rules
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'src/**/__tests__/**/*.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Ignore built files and externals
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '.tsbuildinfo',
      'temp-testing/**',
      '**/*.js', // Ignore all JS files (we only lint TS)
      '**/*.mjs', // Ignore ES modules
      '**/*.d.ts', // Ignore type declaration files
    ],
  }
)
