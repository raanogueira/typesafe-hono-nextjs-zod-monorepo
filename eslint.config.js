// eslint.config.js - ESLint 9+ flat config format
// Rust-like safety patterns + Clippy equivalent for TypeScript

import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Base configurations
  js.configs.recommended,
  ...tseslint.configs.strict,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      // RUST-LIKE STRICTNESS - No escape hatches
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // Ban TypeScript suppressions (like #![forbid(unsafe_code)])
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': false, // Allow ts-expect-error for tests
          'ts-ignore': true, // Forbid ts-ignore completely
          'ts-nocheck': true, // Forbid ts-nocheck completely
          'ts-check': false,
        },
      ],

      // ENHANCED TYPE SAFETY
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: false,
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // DETERMINISM ENFORCEMENT - No direct access to non-deterministic functions
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="parseInt"]',
          message:
            'Use Number() or BigInt() - parseInt can lose precision in financial calculations',
        },
        {
          selector: 'CallExpression[callee.name="parseFloat"]',
          message: 'Use Number() for financial data - parseFloat introduces precision errors',
        },
        {
          selector: 'CallExpression[callee.object.name="Date"][callee.property.name="now"]',
          message:
            'Services must not access time directly - inject getCurrentTime function for testability',
        },
        {
          selector: 'NewExpression[callee.name="Date"]:not([arguments.length=0])',
          message:
            'Services must not create dates directly - inject getCurrentTime function for testability',
        },
        {
          selector: 'CallExpression[callee.object.name="Math"][callee.property.name="random"]',
          message:
            'Services must not use Math.random() - inject systemRng function for testability',
        },
        {
          selector:
            'CallExpression[callee.name="console"][callee.property.name=/^(log|warn|error|info)$/]',
          message: 'Use structured logger instead of console - better observability in production',
        },
        {
          selector: 'FunctionDeclaration[id.name=/^is[A-Z]/]',
          message:
            'Avoid isXxx() boolean helpers - use enums with ts-pattern. Exception: type guards in branded.ts/errors.ts',
        },
        {
          selector: 'ExpressionStatement > UnaryExpression[operator="void"]',
          message:
            'Using "void" to suppress values is not allowed - handle results explicitly with proper logging or Result pattern',
        },
        {
          selector: 'UnaryExpression[operator="void"][argument.type="Identifier"]',
          message:
            'Voiding variables is not allowed - use explicit error handling, logging, or Result pattern instead',
        },
      ],

      // IMMUTABILITY ENFORCEMENT (Rust-like) - other rules handle this better
      // '@typescript-eslint/prefer-readonly-parameter-types' removed - too much ceremony
      'prefer-const': 'error',
      'no-var': 'error',

      // FUNCTIONAL PROGRAMMING PATTERNS
      'no-restricted-globals': [
        'error',
        {
          name: 'parseInt',
          message: 'Use Number() or BigInt() for type safety',
        },
        {
          name: 'parseFloat',
          message: 'Use Number() for type safety',
        },
      ],

      // ENHANCED ERROR HANDLING
      '@typescript-eslint/only-throw-error': 'error',

      // CODE QUALITY
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'error',
      'no-console': 'error', // Use structured logger
      'no-debugger': 'error',
      'no-alert': 'error',

      // IMPORT/EXPORT PATTERNS
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],

      // BAN RELATIVE IMPORTS - enforce path mapping (@/) consistency
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', './*'],
              message:
                'Use absolute imports with @ path mapping instead of relative imports. Example: import { foo } from "@/utils/foo"',
            },
            {
              group: ['**/new Date()*'],
              message: 'Do not import new Date() - use injected time provider',
            },
          ],
        },
      ],
    },
  },

  // Service-specific rules - CRITICAL business logic
  {
    files: ['src/services/**/*.ts'],
    rules: {
      // Allow static-only classes for services
      '@typescript-eslint/no-extraneous-class': 'off',
      // Services must return Result<T, E> - no exceptions
      '@typescript-eslint/explicit-function-return-type': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ThrowStatement',
          message: 'Services must not throw - use Result<T, E> pattern instead',
        },
        {
          selector: 'TryStatement',
          message: 'Services must not use try/catch - use Result<T, E> pattern instead',
        },
      ],
    },
  },

  // Money utilities must be pure
  {
    files: ['src/utils/money.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.type!="Identifier"]',
          message: 'Money utilities must be pure functions - no method calls',
        },
      ],
    },
  },

  // Repository rules - CRITICAL data access layer
  {
    files: ['src/repositories/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'BinaryExpression[operator="+"][left.type="CallExpression"][right.type="CallExpression"]',
          message: 'Repositories should not perform calculations - delegate to services',
        },
      ],
    },
  },

  // Controller rules - orchestration only
  {
    files: ['src/controllers/**/*.ts'],
    rules: {
      'max-lines-per-function': ['error', 50],
      complexity: ['error', 10],
    },
  },

  // System adapter exceptions - these files SHOULD contain non-determinism
  {
    files: ['src/utils/system-*.ts'],
    rules: {
      'no-restricted-syntax': 'off', // System adapters are allowed to use Date.now(), Math.random(), etc.
    },
  },

  // Script utilities exceptions - time and logger utilities
  {
    files: ['src/utils/time.ts', 'src/utils/script-logger.ts', 'src/scripts/**/*.ts'],
    rules: {
      'no-console': 'off', // Script logger needs console
      'no-restricted-syntax': 'off', // Time utilities need Date construction
      'no-restricted-imports': 'off', // Utility files can use relative imports within utils
      '@typescript-eslint/explicit-function-return-type': 'off', // Scripts can have inferred returns
    },
  },

  // Type guard exceptions - these files contain legitimate type guards
  {
    files: ['src/types/branded.ts', 'src/types/errors.ts', 'src/types/strict.ts'],
    rules: {
      'no-restricted-syntax': 'off', // Type guards are allowed here
    },
  },

  // Middleware and app exceptions - strict rules apply but allow framework needs
  {
    files: ['src/app*.ts', 'src/server.ts'],
    rules: {
      // Allow console for infrastructure logging (structured logging for business logic)
      'no-console': 'off',
      // Allow Date.now() for request timing (not business logic)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="parseInt"]',
          message:
            'Use Number() or BigInt() - parseInt can lose precision in financial calculations',
        },
        {
          selector: 'CallExpression[callee.name="parseFloat"]',
          message: 'Use Number() for financial data - parseFloat introduces precision errors',
        },
        {
          selector: 'CallExpression[callee.object.name="Math"][callee.property.name="random"]',
          message:
            'Services must not use Math.random() - inject systemRng function for testability',
        },
        {
          selector: 'FunctionDeclaration[id.name=/^is[A-Z]/]',
          message:
            'Avoid isXxx() boolean helpers - use enums with ts-pattern. Exception: type guards in branded.ts/errors.ts',
        },
      ],
    },
  },

  // Test file exceptions
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-restricted-syntax': 'off',
    },
  },

  // Ignore temporary testing files
  {
    ignores: [
      'temp-testing/**/*',
      'dist/**/*',
      'coverage/**/*',
      'node_modules/**/*',
      '*.js',
      '*.mjs',
    ],
  }
)
