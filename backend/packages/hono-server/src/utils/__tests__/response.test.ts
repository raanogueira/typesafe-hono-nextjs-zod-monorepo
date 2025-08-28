import { describe, it, expect, vi } from 'vitest'
import { ResponseUtil } from '../response'

// Mock Hono context
const createMockContext = () => ({
  json: vi.fn((data, status = 200) => ({
    data,
    status,
    headers: { 'content-type': 'application/json' },
  })),
})

describe('ResponseUtil', () => {
  it('creates success response with data', () => {
    const mockContext = createMockContext()
    const testData = { id: '123', name: 'Test' }

    ResponseUtil.success(mockContext as any, testData)

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: testData,
        meta: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      }),
      200
    )
  })

  it('creates success response with message', () => {
    const mockContext = createMockContext()
    const testData = { id: '123' }

    ResponseUtil.success(mockContext as any, testData, 'Operation completed')

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: testData,
        message: 'Operation completed',
        meta: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      }),
      200
    )
  })

  it('creates created response', () => {
    const mockContext = createMockContext()
    const testData = { id: '456', name: 'New Item' }

    ResponseUtil.created(mockContext as any, testData, 'Item created')

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: testData,
        message: 'Item created',
        meta: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      }),
      201
    )
  })

  it('creates badRequest response with details', () => {
    const mockContext = createMockContext()

    ResponseUtil.badRequest(mockContext as any, 'Invalid input', 'VALIDATION_ERROR', {
      field: 'email',
    })

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: { field: 'email' },
        },
        meta: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      }),
      400
    )
  })

  it('creates notFound response', () => {
    const mockContext = createMockContext()

    ResponseUtil.notFound(mockContext as any, 'User not found', 'USER_NOT_FOUND')

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          type: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        meta: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      }),
      404
    )
  })

  it('creates internalError response', () => {
    const mockContext = createMockContext()

    ResponseUtil.internalError(mockContext as any, 'Database connection failed', 'DB_ERROR')

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: {
          type: 'DB_ERROR',
          message: 'Database connection failed',
        },
        meta: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      }),
      500
    )
  })
})
