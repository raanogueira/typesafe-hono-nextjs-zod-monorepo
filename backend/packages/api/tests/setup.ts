// Global test setup - runs before all tests
// Configures test environment with proper safety guards

import { beforeAll, afterAll, beforeEach } from 'vitest'

// =============================================================================
// GLOBAL TEST SETUP
// =============================================================================

beforeAll(() => {
  // Ensure we're in test environment
  process.env.NODE_ENV = 'test'
  process.env.LOG_LEVEL = 'error'

  // Disable console logs during tests (unless debugging)
  if (!process.env.VITEST_DEBUG) {
    console.log = () => {}
    console.info = () => {}
    console.warn = () => {}
    // Keep console.error for important test failures
  }
})

afterAll(() => {
  // Cleanup any global resources
})

beforeEach(() => {
  // Reset any global state before each test
  // This ensures tests don't interfere with each other
})

// =============================================================================
// TEST UTILITIES
// =============================================================================

/**
 * Mock date for deterministic testing
 * Use this instead of Date.now() in tests
 */
export const mockCurrentTime = (isoString: string): (() => Date) => {
  const fixedDate = new Date(isoString)
  return (): Date => fixedDate
}

/**
 * Mock system RNG for deterministic testing
 * Use this instead of Math.random() in tests
 */
export const mockRandom = (value: number): (() => number) => {
  if (value < 0 || value >= 1) {
    throw new Error('Mock random value must be 0 <= value < 1')
  }
  return (): number => value
}

/**
 * Create a deterministic test environment
 * Forces all non-deterministic functions to be mocked
 */
export const createDeterministicEnv = (options: {
  currentTime: string
  randomSeed: number
}): {
  getCurrentTime: () => Date
  getRandomValue: () => number
} => {
  return {
    getCurrentTime: mockCurrentTime(options.currentTime),
    getRandomValue: mockRandom(options.randomSeed),
  }
}
