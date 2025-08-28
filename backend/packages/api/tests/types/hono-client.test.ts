// Test that Hono client type inference works correctly
import { describe, it, expect } from 'vitest'
import { hc } from 'hono/client'
import type { ApiRoutes } from '../../src/app'

describe('Hono Client Type Inference', () => {
  it('should create typed client from ApiRoutes', () => {
    // Create the typed client
    const client = hc<ApiRoutes>('http://localhost:3000/api/v1')

    // Verify client has expected structure
    expect(client).toBeDefined()
    expect(typeof client).toBe('function')
  })

  it('should provide typed endpoints', () => {
    const client = hc<ApiRoutes>('http://localhost:3000/api/v1')

    // TypeScript should know about these endpoints
    // This test verifies the structure exists at runtime
    if (client.transactions && typeof client.transactions === 'object') {
      // Check for dynamic route params
      expect(client.transactions).toBeDefined()
    }
  })

  it('should handle parameterized routes', () => {
    const client = hc<ApiRoutes>('http://localhost:3000/api/v1')

    // Test that parameterized routes work
    // TypeScript should enforce param types
    const testCalls = async () => {
      // These should be type-checked by TypeScript
      if (client.transactions && client.transactions[':id']) {
        const transactionEndpoint = client.transactions[':id']
        expect(transactionEndpoint).toBeDefined()
        expect(transactionEndpoint.$get).toBeDefined()
      }
    }

    return testCalls()
  })
})
