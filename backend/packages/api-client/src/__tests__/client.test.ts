import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHttpClient, createCoreApiClient, createCoreApiClientWithHttp } from '../client'
import type { HttpClient, ClientError } from '../client'
import { z } from 'zod'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Test schemas
const TestRequestSchema = z.object({
  id: z.string(),
})

const TestResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
})

type TestRequest = z.infer<typeof TestRequestSchema>

describe('HttpClient', () => {
  let httpClient: HttpClient

  beforeEach(() => {
    vi.clearAllMocks()
    httpClient = createHttpClient('https://api.test.com')
  })

  it('handles successful GET request', async () => {
    const mockResponse = { id: '123', name: 'Test Item' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await httpClient.get('/test', TestRequestSchema, TestResponseSchema, {
      id: '123',
    })

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toEqual(mockResponse)
    }
    expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/test')
  })

  it('handles validation error in request', async () => {
    const result = await httpClient.get(
      '/test',
      TestRequestSchema,
      TestResponseSchema,
      {} as TestRequest // Invalid - missing id
    )

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('ValidationError')
      expect(result.error.message).toContain('Invalid request')
    }
  })

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'))

    const result = await httpClient.get('/test', TestRequestSchema, TestResponseSchema, {
      id: '123',
    })

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('NetworkError')
      expect(result.error.message).toContain('Network error')
    }
  })

  it('handles HTTP error status', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not Found'),
    })

    const result = await httpClient.get('/test', TestRequestSchema, TestResponseSchema, {
      id: '123',
    })

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('ApiError')
      expect((result.error as any).statusCode).toBe(404)
    }
  })

  it('handles JSON parsing error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Invalid JSON')),
    })

    const result = await httpClient.get('/test', TestRequestSchema, TestResponseSchema, {
      id: '123',
    })

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('NetworkError')
      expect(result.error.message).toContain('Failed to parse JSON')
    }
  })

  it('handles response validation error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ invalid: 'response' }),
    })

    const result = await httpClient.get('/test', TestRequestSchema, TestResponseSchema, {
      id: '123',
    })

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('ValidationError')
      expect(result.error.message).toContain('Invalid response format')
    }
  })
})

describe('CoreApiClient factory functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createCoreApiClient creates client with HTTP client', () => {
    const client = createCoreApiClient('https://api.test.com')

    expect(client).toHaveProperty('getTransaction')
    expect(typeof client.getTransaction).toBe('function')
  })

  it('createCoreApiClientWithHttp accepts custom HTTP client', () => {
    const mockHttpClient: HttpClient = {
      get: vi.fn().mockResolvedValue({ isOk: () => true, value: {} }),
    }

    const client = createCoreApiClientWithHttp(mockHttpClient)

    expect(client).toHaveProperty('getTransaction')
    expect(typeof client.getTransaction).toBe('function')
  })

  it('getTransaction calls HTTP client with correct parameters', async () => {
    const mockHttpClient: HttpClient = {
      get: vi.fn().mockResolvedValue({
        isOk: () => true,
        value: { id: '123', amount: 1000 },
      }),
    }

    const client = createCoreApiClientWithHttp(mockHttpClient)

    await client.getTransaction({ id: '123' })

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      '/api/v1/transactions/123',
      expect.any(Object), // TransactionRequestSchema
      expect.any(Object), // TransactionResponseSchema
      { id: '123' }
    )
  })
})

describe('Error type discrimination', () => {
  it('ApiError has correct structure', () => {
    const error: ClientError = {
      type: 'ApiError',
      statusCode: 500,
      message: 'Internal Server Error',
      endpoint: 'https://api.test.com/test',
    }

    expect(error.type).toBe('ApiError')
    if (error.type === 'ApiError') {
      expect(error.statusCode).toBe(500)
      expect(error.endpoint).toBe('https://api.test.com/test')
    }
  })

  it('NetworkError has correct structure', () => {
    const error: ClientError = {
      type: 'NetworkError',
      message: 'Connection refused',
      url: 'https://api.test.com/test',
    }

    expect(error.type).toBe('NetworkError')
    if (error.type === 'NetworkError') {
      expect(error.url).toBe('https://api.test.com/test')
    }
  })

  it('ValidationError has correct structure', () => {
    const error: ClientError = {
      type: 'ValidationError',
      message: 'Invalid field',
      field: 'email',
    }

    expect(error.type).toBe('ValidationError')
    if (error.type === 'ValidationError') {
      expect(error.field).toBe('email')
    }
  })
})
