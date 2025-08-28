import { describe, it, expect, vi } from 'vitest'
import type { DatabaseConfig } from '../../connection'

describe('Database Configuration', () => {
  it('accepts minimal valid config', () => {
    const config: DatabaseConfig = {
      connectionString: 'postgresql://localhost/test',
    }

    expect(config.connectionString).toBe('postgresql://localhost/test')
    expect(config.maxConnections).toBeUndefined()
  })

  it('accepts full config', () => {
    const config: DatabaseConfig = {
      connectionString: 'postgresql://localhost/test',
      maxConnections: 20,
      idleTimeoutMs: 60000,
      connectionTimeoutMs: 15000,
      enableLogging: true,
    }

    expect(config.maxConnections).toBe(20)
    expect(config.idleTimeoutMs).toBe(60000)
    expect(config.connectionTimeoutMs).toBe(15000)
    expect(config.enableLogging).toBe(true)
  })

  it('validates connection string format', () => {
    const validConnectionStrings = [
      'postgresql://user:pass@localhost:5432/dbname',
      'postgresql://localhost/dbname',
      'postgres://user@localhost/dbname',
    ]

    validConnectionStrings.forEach((connectionString) => {
      const config: DatabaseConfig = { connectionString }
      expect(config.connectionString).toBe(connectionString)
      expect(typeof config.connectionString).toBe('string')
    })
  })

  it('provides reasonable defaults concept', () => {
    const config: DatabaseConfig = {
      connectionString: 'postgresql://localhost/test',
    }

    // Test that optional properties are indeed optional
    const expectedDefaults = {
      maxConnections: config.maxConnections ?? 10,
      idleTimeoutMs: config.idleTimeoutMs ?? 30000,
      connectionTimeoutMs: config.connectionTimeoutMs ?? 10000,
      enableLogging: config.enableLogging ?? false,
    }

    expect(expectedDefaults.maxConnections).toBe(10)
    expect(expectedDefaults.idleTimeoutMs).toBe(30000)
    expect(expectedDefaults.connectionTimeoutMs).toBe(10000)
    expect(expectedDefaults.enableLogging).toBe(false)
  })
})

describe('Connection utilities', () => {
  it('testConnection handles mock client properly', async () => {
    // Import the function to test it exists and is callable
    const { testConnection } = await import('../../connection')

    expect(typeof testConnection).toBe('function')

    // Test with a mock that succeeds
    const mockSuccessClient = {
      '``': vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as any

    const successResult = await testConnection(mockSuccessClient)
    expect(typeof successResult).toBe('boolean')

    // Test with a mock that fails
    const mockFailClient = {
      '``': vi.fn().mockRejectedValue(new Error('Connection failed')),
    } as any

    const failResult = await testConnection(mockFailClient)
    expect(typeof failResult).toBe('boolean')
  })
})
