import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Strict console restrictions - no console statements allowed
      'no-console': 'error',
      // Allow default exports for Next.js components
      'no-restricted-exports': 'off',
      // Relax TypeScript rules for frontend presentation layer
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      // BAN ALL RELATIVE IMPORTS - Use subpath imports (#hooks/*, #lib/*, etc.)
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', './*', './*/..'],
              message:
                "ALL relative imports are banned. Use subpath imports (#hooks/*, #lib/*, #components/*, etc.) or workspace imports (@typesafe-stack/*). Example: import { foo } from '#hooks/foo' or import { api } from '@typesafe-stack/api-client'",
            },
          ],
        },
      ],
    },
  },
  // Environment validation exception - only allow console.error for startup failures
  {
    files: ['src/env.ts'],
    rules: {
      'no-console': [
        'error',
        {
          allow: ['error'],
        },
      ],
    },
  },
]

export default eslintConfig
