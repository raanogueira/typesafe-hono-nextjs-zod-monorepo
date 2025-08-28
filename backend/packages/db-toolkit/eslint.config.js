// ESLint configuration for db-toolkit
// Database utilities with relaxed rules for infrastructure code

import sharedConfig from '../../shared-configs/eslint.base.js'

export default [
  ...sharedConfig,
  // Relax some rules for database infrastructure code
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/strict-boolean-expressions': 'off', // Allow truthy checks in database code
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Allow || for defaults in database code
      'no-restricted-syntax': 'off', // Allow division operations in performance timing code
    },
  },
]
