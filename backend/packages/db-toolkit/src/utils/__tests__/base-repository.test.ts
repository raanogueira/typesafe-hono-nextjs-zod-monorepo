import { describe, it, expect, vi } from 'vitest'
import {
  BaseRepository,
  createDatabaseError,
  createNotFoundError,
  type DatabaseError,
  type NotFoundError,
} from '../../base-repository'

// Test implementation of BaseRepository
class TestRepository extends BaseRepository {
  async testExecuteQuery<T>(operation: string, query: () => Promise<T>) {
    return this.executeQuery(operation, query)
  }

  async testExecuteQueryWithNull<T>(operation: string, query: () => Promise<T[] | T | undefined>) {
    return this.executeQueryWithNull(operation, query)
  }

  async testExecuteQueryArray<T>(operation: string, query: () => Promise<T[]>) {
    return this.executeQueryArray(operation, query)
  }

  async testExecuteCount(operation: string, query: () => Promise<number>) {
    return this.executeCount(operation, query)
  }

  async testExecuteGetById<T>(entityType: string, id: string, query: () => Promise<T[]>) {
    return this.executeGetById(entityType, id, query)
  }

  async testExecuteGetByKey<T>(
    entityType: string,
    keyDescription: string,
    query: () => Promise<T[]>
  ) {
    return this.executeGetByKey(entityType, keyDescription, query)
  }
}

describe('BaseRepository', () => {
  const repository = new TestRepository()

  describe('executeQuery', () => {
    it('returns Ok result for successful query', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ id: 1, name: 'Test' })

      const result = await repository.testExecuteQuery('testOperation', mockQuery)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({ id: 1, name: 'Test' })
      }
      expect(mockQuery).toHaveBeenCalledOnce()
    })

    it('returns Err result for failed query', async () => {
      const mockQuery = vi.fn().mockRejectedValue(new Error('Database connection failed'))

      const result = await repository.testExecuteQuery('testOperation', mockQuery)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toEqual({
          type: 'DatabaseError',
          message: 'Error: Database connection failed',
          operation: 'testOperation',
        })
      }
    })
  })

  describe('executeQueryWithNull', () => {
    it('returns first item from array result', async () => {
      const mockQuery = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }])

      const result = await repository.testExecuteQueryWithNull('testOperation', mockQuery)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({ id: 1 })
      }
    })

    it('returns null for empty array result', async () => {
      const mockQuery = vi.fn().mockResolvedValue([])

      const result = await repository.testExecuteQueryWithNull('testOperation', mockQuery)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBeNull()
      }
    })

    it('returns null for undefined result', async () => {
      const mockQuery = vi.fn().mockResolvedValue(undefined)

      const result = await repository.testExecuteQueryWithNull('testOperation', mockQuery)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBeNull()
      }
    })

    it('returns single result when not array', async () => {
      const mockQuery = vi.fn().mockResolvedValue({ id: 1, name: 'Test' })

      const result = await repository.testExecuteQueryWithNull('testOperation', mockQuery)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({ id: 1, name: 'Test' })
      }
    })
  })

  describe('executeQueryArray', () => {
    it('returns array result', async () => {
      const mockQuery = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }])

      const result = await repository.testExecuteQueryArray('testOperation', mockQuery)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toHaveLength(3)
        expect(result.value).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
      }
    })

    it('returns empty array for no results', async () => {
      const mockQuery = vi.fn().mockResolvedValue([])

      const result = await repository.testExecuteQueryArray('testOperation', mockQuery)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual([])
      }
    })
  })

  describe('executeCount', () => {
    it('returns count result', async () => {
      const mockQuery = vi.fn().mockResolvedValue(42)

      const result = await repository.testExecuteCount('countOperation', mockQuery)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toBe(42)
      }
    })
  })

  describe('executeGetById', () => {
    it('returns entity when found', async () => {
      const mockQuery = vi.fn().mockResolvedValue([{ id: '123', name: 'Test User' }])

      const result = await repository.testExecuteGetById('User', '123', mockQuery)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({ id: '123', name: 'Test User' })
      }
    })

    it('returns NotFoundError when entity not found', async () => {
      const mockQuery = vi.fn().mockResolvedValue([])

      const result = await repository.testExecuteGetById('User', '999', mockQuery)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toEqual({
          type: 'UserNotFound',
          message: 'User with ID 999 not found',
          id: '999',
        })
      }
    })

    it('handles database errors', async () => {
      const mockQuery = vi.fn().mockRejectedValue(new Error('Connection timeout'))

      const result = await repository.testExecuteGetById('User', '123', mockQuery)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toEqual({
          type: 'DatabaseError',
          message: 'Error: Connection timeout',
          operation: 'getUserById',
        })
      }
    })
  })

  describe('executeGetByKey', () => {
    it('returns entity when found by custom key', async () => {
      const mockQuery = vi
        .fn()
        .mockResolvedValue([{ email: 'test@example.com', name: 'Test User' }])

      const result = await repository.testExecuteGetByKey(
        'User',
        'email test@example.com',
        mockQuery
      )

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual({ email: 'test@example.com', name: 'Test User' })
      }
    })

    it('returns NotFoundError when entity not found by key', async () => {
      const mockQuery = vi.fn().mockResolvedValue([])

      const result = await repository.testExecuteGetByKey(
        'User',
        'email missing@example.com',
        mockQuery
      )

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error).toEqual({
          type: 'UserNotFound',
          message: 'User with email missing@example.com not found',
          id: 'email missing@example.com',
        })
      }
    })
  })
})

describe('Helper functions', () => {
  describe('createDatabaseError', () => {
    it('creates correct DatabaseError structure', () => {
      const error = createDatabaseError('testOperation', new Error('Something went wrong'))

      expect(error).toEqual({
        type: 'DatabaseError',
        message: 'Error: Something went wrong',
        operation: 'testOperation',
      })
    })

    it('handles string errors', () => {
      const error = createDatabaseError('testOperation', 'String error message')

      expect(error).toEqual({
        type: 'DatabaseError',
        message: 'String error message',
        operation: 'testOperation',
      })
    })
  })

  describe('createNotFoundError', () => {
    it('creates correct NotFoundError structure', () => {
      const error = createNotFoundError('User', '123')

      expect(error).toEqual({
        type: 'UserNotFound',
        message: 'User with ID 123 not found',
        id: '123',
      })
    })

    it('handles different entity types', () => {
      const error = createNotFoundError('Product', 'abc-def-123')

      expect(error).toEqual({
        type: 'ProductNotFound',
        message: 'Product with ID abc-def-123 not found',
        id: 'abc-def-123',
      })
    })
  })
})

describe('Type definitions', () => {
  it('DatabaseError has correct structure', () => {
    const error: DatabaseError = {
      type: 'DatabaseError',
      message: 'Test error',
      operation: 'testOp',
    }

    expect(error.type).toBe('DatabaseError')
    expect(error.message).toBe('Test error')
    expect(error.operation).toBe('testOp')
  })

  it('NotFoundError has correct structure', () => {
    const error: NotFoundError = {
      type: 'UserNotFound',
      message: 'User not found',
      id: '123',
    }

    expect(error.type).toBe('UserNotFound')
    expect(error.message).toBe('User not found')
    expect(error.id).toBe('123')
  })
})
