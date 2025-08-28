// ESLint configuration for hono-server
// Uses modern ESLint v9 shared config with relaxed rules for framework code

import sharedConfig from '../../shared-configs/eslint.base.js'

export default [
  ...sharedConfig,
  // Relax some rules for framework/utility code
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/strict-boolean-expressions': 'off', // Allow truthy checks in framework code
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Allow || for defaults in framework code
    },
  },
]
