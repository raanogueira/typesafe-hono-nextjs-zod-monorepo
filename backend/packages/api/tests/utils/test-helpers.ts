// Test helper utilities - common patterns for all test suites

import type { Context } from 'hono'
import { Hono } from 'hono'
import { vi } from 'vitest'
import type { Result } from '@/types/strict'
import { ok, err } from '@/types/strict'

// Mock context helpers

/**
 * Create a mock Hono Context for testing controllers
 */
export const createMockContext = (overrides: Partial<Context> = {}): Context => {
  const mockContext = {
    req: {
      method: 'GET',
      path: '/test',
      json: vi.fn().mockResolvedValue({}),
      header: vi.fn().mockReturnValue(''),
      param: vi.fn().mockReturnValue(''),
      query: vi.fn().mockReturnValue(''),
      valid: vi.fn().mockReturnValue({}),
    },
    res: {
      status: 200,
      headers: new Map(),
    },
    json: vi.fn().mockImplementation((obj, status = 200) => ({
      status,
      body: JSON.stringify(obj),
      headers: new Headers({ 'content-type': 'application/json' }),
    })),
    text: vi.fn().mockImplementation((text, status = 200) => ({
      status,
      body: text,
      headers: new Headers({ 'content-type': 'text/plain' }),
    })),
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    var: {},
    ...overrides,
  } as unknown as Context

  return mockContext
}

/**
 * Create a test Hono app with middleware disabled
 */
export const createTestApp = (): Hono => {
  const app = new Hono()
  // Disable middleware for faster testing
  return app
}

// Test app instance - simulates real app for integration tests
export const testApp = {
  request: (url: string, init?: RequestInit) => {
    // Mock implementation - in real tests this would hit actual app
    return fetch(`http://localhost:3001${url}`, init)
  },
}

// Result helpers

/**
 * Assert that a Result is Ok and return the value
 */
export const assertOk = <T, E>(result: Result<T, E>): T => {
  if (result.isErr()) {
    throw new Error(`Expected Ok, got Err: ${JSON.stringify(result.error)}`)
  }
  return result.value
}

/**
 * Assert that a Result is Err and return the error
 */
export const assertErr = <T, E>(result: Result<T, E>): E => {
  if (result.isOk()) {
    throw new Error(`Expected Err, got Ok: ${JSON.stringify(result.value)}`)
  }
  return result.error
}

/**
 * Create a successful Result for testing
 */
export const createOkResult = <T>(value: T): Result<T, never> => {
  return ok(value)
}

/**
 * Create an error Result for testing
 */
export const createErrResult = <E>(error: E): Result<never, E> => {
  return err(error)
}

// Async helpers

/**
 * Wait for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Run a function with a timeout
 */
export const withTimeout = <T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
    }),
  ])
}

// Validation helpers

/**
 * Assert that an object matches expected shape
 */
export const assertShape = (actual: unknown, expected: Record<string, unknown>): void => {
  if (typeof actual !== 'object' || actual === null) {
    throw new Error(`Expected object, got ${typeof actual}`)
  }

  const actualObj = actual as Record<string, unknown>

  for (const [key, expectedValue] of Object.entries(expected)) {
    if (!(key in actualObj)) {
      throw new Error(`Missing property: ${key}`)
    }

    if (typeof expectedValue === 'object' && expectedValue !== null) {
      assertShape(actualObj[key], expectedValue as Record<string, unknown>)
    } else if (actualObj[key] !== expectedValue) {
      throw new Error(`Property ${key}: expected ${expectedValue}, got ${actualObj[key]}`)
    }
  }
}

/**
 * Assert that a value is a valid timestamp
 */
export const assertValidTimestamp = (timestamp: unknown): void => {
  if (typeof timestamp !== 'string') {
    throw new Error(`Expected string timestamp, got ${typeof timestamp}`)
  }

  const date = new Date(timestamp)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${timestamp}`)
  }
}

/**
 * Assert that a value is a valid UUID
 */
export const assertValidUUID = (uuid: unknown): void => {
  if (typeof uuid !== 'string') {
    throw new Error(`Expected string UUID, got ${typeof uuid}`)
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    throw new Error(`Invalid UUID format: ${uuid}`)
  }
}

// HTTP helpers

/**
 * Create a mock HTTP request for testing
 */
export const createMockRequest = (
  options: {
    method?: string
    path?: string
    headers?: Record<string, string>
    body?: unknown
  } = {}
): Request => {
  const { method = 'GET', path = '/test', headers = {}, body } = options

  const url = `http://localhost:3000${path}`
  const init: RequestInit = {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  }

  if (body && method !== 'GET') {
    init.body = JSON.stringify(body)
  }

  return new Request(url, init)
}

/**
 * Extract JSON from a Response object
 */
export const extractJson = async (response: Response): Promise<unknown> => {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Failed to parse JSON: ${text}`)
  }
}

// Function mocking helpers

/**
 * Create a deterministic function for testing services
 */
export const createMockFunction = <T extends (...args: unknown[]) => unknown>(
  implementation?: T
): T => {
  return vi.fn(implementation) as T
}

/**
 * Create a mock function that always resolves
 */
export const createMockAsyncFunction = <T, Args extends unknown[]>(
  value: T
): ((...args: Args) => Promise<T>) => {
  return vi.fn().mockResolvedValue(value)
}

/**
 * Create a mock function that always rejects
 */
export const createMockAsyncError = <Args extends unknown[]>(
  error: Error
): ((...args: Args) => Promise<never>) => {
  return vi.fn().mockRejectedValue(error)
}

// Environment helpers

/**
 * Set environment variables for a test
 */
export const withEnv = <T>(env: Record<string, string>, fn: () => T): T => {
  const originalEnv = { ...process.env }

  // Set test environment variables
  Object.assign(process.env, env)

  try {
    return fn()
  } finally {
    // Restore original environment
    process.env = originalEnv
  }
}

/**
 * Run test with clean environment
 */
export const withCleanEnv = <T>(fn: () => T): T => {
  const originalEnv = { ...process.env }

  // Clear all environment variables except NODE_ENV
  for (const key of Object.keys(process.env)) {
    if (key !== 'NODE_ENV') {
      delete process.env[key]
    }
  }

  try {
    return fn()
  } finally {
    // Restore original environment
    process.env = originalEnv
  }
}
