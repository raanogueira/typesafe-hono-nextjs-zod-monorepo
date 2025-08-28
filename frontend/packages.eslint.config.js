// Frontend packages ESLint config - for React utility packages (no Next.js)
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
      // CORE TYPE SAFETY - Same as backend and frontend
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',

      // CODE QUALITY - Same as backend and frontend
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',

      // FINANCIAL SAFETY - Same precision rules as backend
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
          selector:
            'BinaryExpression[operator="+"] > Literal[raw=/^\\d+$/], BinaryExpression[operator="-"] > Literal[raw=/^\\d+$/], BinaryExpression[operator="*"] > Literal[raw=/^\\d+$/], BinaryExpression[operator="/"] > Literal[raw=/^\\d+$/]',
          message:
            'Use BigInt for financial calculations - number literals can lose precision. Example: BigInt(100) instead of 100',
        },
      ],

      // IMPORT/EXPORT PATTERNS - Same as backend
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

      // ABSOLUTE IMPORTS - Same as backend
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', './*'],
              message:
                'Use absolute imports with @ path mapping instead of relative imports. Example: import { foo } from "@/utils/foo"',
            },
          ],
        },
      ],

      // FRONTEND PACKAGE SPECIFIC - More lenient than backend
      // No explicit return types required for utility functions
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Allow flexible boolean expressions for utilities
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',

      // Allow console for development in frontend packages
      'no-console': 'warn',
    },
  },

  // Test file exceptions
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      'tests/**/*.ts',
      'test/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-restricted-imports': 'off',
      'no-restricted-syntax': 'off',
    },
  },

  // Frontend package specific ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/*.d.ts',
      'coverage/**',
    ],
  }
)
