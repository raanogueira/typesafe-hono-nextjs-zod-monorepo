// Shared ESLint configuration for Capital Shield
// Common rules used by both backend and frontend
import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export const createBaseConfig = (options = {}) => {
  const { tier = 'strict', allowRelativeImports = false } = options

  return tseslint.config(
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
        // CORE TYPE SAFETY - Both tiers get these
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',

        // CRITICAL FOR FINANCIAL APPS - Both tiers
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/only-throw-error': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error', // Catch dead code

        // CODE QUALITY - Both tiers
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

        // REMOVE OVERLY VERBOSE RULES
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',

        // FINANCIAL SAFETY - Number precision
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

        // BAN NUMBER LITERALS IN FINANCIAL CALCULATIONS
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

        // ABSOLUTE IMPORTS (conditional)
        'no-restricted-imports': allowRelativeImports
          ? 'off'
          : [
              'error',
              {
                patterns: [
                  {
                    group: ['../*', './*', './*/..'],
                    message:
                      'Use absolute imports with @ path mapping instead of relative imports. Example: import { foo } from "@/utils/foo"',
                  },
                ],
              },
            ],
      },
    },

    // Test file exceptions - allow relative imports
    {
      files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*.ts', 'test/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn', // Tests can be more flexible
        '@typescript-eslint/explicit-function-return-type': 'off', // Test functions can infer
        'no-restricted-imports': 'off', // Allow relative imports in tests
        'no-restricted-syntax': 'off', // Tests can use number literals
      },
    },

    // Common ignores
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
}

export default createBaseConfig()
