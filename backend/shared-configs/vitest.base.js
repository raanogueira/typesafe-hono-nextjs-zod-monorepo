// Shared Vitest configuration for all Capital Shield packages
import { defineConfig } from 'vitest/config'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

export const createVitestConfig = (packageRoot = process.cwd()) => {
  return defineConfig({
    plugins: [tsconfigPaths()],
    test: {
      globals: true,
      environment: 'node',

      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/**',
          'dist/**',
          'coverage/**',
          'temp-testing/**',
          '**/*.test.ts',
          '**/*.spec.ts',
          'src/scripts/**',
          'src/types/database.ts',
          'eslint.config.js',
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
      },

      include: ['tests/**/*.{test,spec}.ts', 'src/**/*.{test,spec}.ts'],

      testTimeout: 10000,
      watch: false,
      reporters: ['verbose', 'json'],
      setupFiles: ['tests/setup.ts'],
    },

    resolve: {
      alias: {
        '@': path.resolve(packageRoot, './src'),
        '@tests': path.resolve(packageRoot, './tests'),
      },
    },

    define: {
      'process.env.NODE_ENV': '"test"',
      'process.env.LOG_LEVEL': '"error"',
    },
  })
}
