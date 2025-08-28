import { describe, it, expect, vi } from 'vitest'
import { SmartResponse, respond, defaultErrorMappings } from '../smart-response'
import { ok, err } from 'neverthrow'

// Mock Hono context
const createMockContext = () => ({
  json: vi.fn((data, status = 200) => ({
    data,
    status,
    headers: { 'content-type': 'application/json' },
  })),
})

describe('SmartResponse', () => {
  it('handles successful results', () => {
    const mockContext = createMockContext()
    const handler = new SmartResponse(mockContext as any)

    const result = ok({ id: '123', name: 'Test' })
    handler.handle(result)

    expect(mockContext.json).toHaveBeenCalledWith({ id: '123', name: 'Test' })
  })

  it('maps known error types to correct HTTP status', () => {
    const mockContext = createMockContext()
    const handler = new SmartResponse(mockContext as any)

    const result = err({ type: 'ValidationError', message: 'Invalid input' })
    handler.handle(result)

    expect(mockContext.json).toHaveBeenCalledWith(
      {
        error: 'Invalid input',
        code: 'VALIDATION_ERROR',
      },
      400
    )
  })

  it('uses default message when error has no message', () => {
    const mockContext = createMockContext()
    const handler = new SmartResponse(mockContext as any)

    const result = err({ type: 'UserNotFound' })
    handler.handle(result)

    expect(mockContext.json).toHaveBeenCalledWith(
      {
        error: 'UserNotFound occurred',
        code: 'USER_NOT_FOUND',
      },
      404
    )
  })

  it('falls back to 500 for unmapped error types', () => {
    const mockContext = createMockContext()
    const handler = new SmartResponse(mockContext as any)

    const result = err({ type: 'UnknownError', message: 'Something broke' })
    handler.handle(result)

    expect(mockContext.json).toHaveBeenCalledWith(
      {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      500
    )
  })

  it('supports custom success transformation', () => {
    const mockContext = createMockContext()
    const handler = new SmartResponse(mockContext as any)

    const result = ok({ id: '123', name: 'Test' })
    handler.handle(result, (data) => ({ user: data, meta: { version: 1 } }))

    expect(mockContext.json).toHaveBeenCalledWith({
      user: { id: '123', name: 'Test' },
      meta: { version: 1 },
    })
  })
})

describe('respond factory function', () => {
  it('creates SmartResponse instance with default mappings', () => {
    const mockContext = createMockContext()
    const handler = respond(mockContext as any)

    expect(handler).toBeInstanceOf(SmartResponse)
  })

  it('merges custom error mappings', () => {
    const mockContext = createMockContext()
    const customMappings = {
      CustomError: { status: 418, code: 'TEAPOT', message: 'I am a teapot' },
    }
    const handler = respond(mockContext as any, customMappings)

    const result = err({ type: 'CustomError' })
    handler.handle(result)

    expect(mockContext.json).toHaveBeenCalledWith(
      {
        error: 'I am a teapot',
        code: 'TEAPOT',
      },
      418
    )
  })
})

describe('defaultErrorMappings', () => {
  it('has correct mappings for common error types', () => {
    expect(defaultErrorMappings.ValidationError).toEqual({
      status: 400,
      code: 'VALIDATION_ERROR',
    })

    expect(defaultErrorMappings.UserNotFound).toEqual({
      status: 404,
      code: 'USER_NOT_FOUND',
    })

    expect(defaultErrorMappings.DatabaseError).toEqual({
      status: 500,
      code: 'DATABASE_ERROR',
      message: 'Internal server error',
    })
  })
})
