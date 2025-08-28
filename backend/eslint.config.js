// Backend ESLint config - Financial application safety with modern ESLint v9
// Uses the new shared base configuration with projectService auto-discovery

import sharedConfig from './shared-configs/eslint.base.js'
import drizzlePlugin from 'eslint-plugin-drizzle'

export default [
  // Import all shared rules (modern ESLint v9 flat config)
  ...sharedConfig,

  // Drizzle ORM specific rules for data safety (exclude gateway which doesn't use drizzle)
  {
    files: ['packages/**/*.ts'],
    ignores: ['packages/gateway/**/*.ts'],
    plugins: {
      drizzle: drizzlePlugin,
    },
    rules: {
      'drizzle/enforce-delete-with-where': 'error',
      'drizzle/enforce-update-with-where': 'error',
    },
  },
]
