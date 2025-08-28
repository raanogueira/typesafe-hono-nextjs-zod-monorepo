// Base repository with Result<T,E> pattern enforcement
import type { Result } from 'neverthrow'
import { ok, err } from 'neverthrow'

// Standard database error type
export interface DatabaseError {
  readonly type: 'DatabaseError'
  readonly message: string
  readonly operation: string
}

// Base repository class that enforces Result<T,E> pattern
export abstract class BaseRepository {
  /**
   * Execute a database operation safely with Result<T,E> pattern
   */
  protected async executeQuery<T>(
    operation: string,
    query: () => Promise<T>
  ): Promise<Result<T, DatabaseError>> {
    try {
      const result = await query()
      return ok(result)
    } catch (error) {
      return err({
        type: 'DatabaseError' as const,
        message: String(error),
        operation,
      })
    }
  }

  /**
   * Execute a database operation that might return null safely
   */
  protected async executeQueryWithNull<T>(
    operation: string,
    query: () => Promise<T[] | T | undefined>
  ): Promise<Result<T | null, DatabaseError>> {
    try {
      const result = await query()

      if (Array.isArray(result)) {
        return ok(result[0] ?? null)
      }

      return ok(result ?? null)
    } catch (error) {
      return err({
        type: 'DatabaseError' as const,
        message: String(error),
        operation,
      })
    }
  }

  /**
   * Execute a database operation that returns an array safely
   */
  protected async executeQueryArray<T>(
    operation: string,
    query: () => Promise<T[]>
  ): Promise<Result<readonly T[], DatabaseError>> {
    try {
      const result = await query()
      return ok(result)
    } catch (error) {
      return err({
        type: 'DatabaseError' as const,
        message: String(error),
        operation,
      })
    }
  }

  /**
   * Execute an operation that returns a count or number
   */
  protected async executeCount(
    operation: string,
    query: () => Promise<number>
  ): Promise<Result<number, DatabaseError>> {
    return this.executeQuery(operation, query)
  }

  /**
   * Execute a getById query that returns either the entity or a NotFound error
   */
  protected async executeGetById<T>(
    entityType: string,
    id: string,
    query: () => Promise<T[]>
  ): Promise<Result<T, DatabaseError | NotFoundError>> {
    try {
      const result = await query()
      const entity = result[0]

      if (entity === undefined || entity === null) {
        return err(createNotFoundError(entityType, id))
      }

      return ok(entity)
    } catch (error) {
      return err({
        type: 'DatabaseError' as const,
        message: String(error),
        operation: `get${entityType}ById`,
      })
    }
  }

  /**
   * Execute a get query with custom identifier that returns either the entity or a NotFound error
   */
  protected async executeGetByKey<T>(
    entityType: string,
    keyDescription: string,
    query: () => Promise<T[]>
  ): Promise<Result<T, DatabaseError | NotFoundError>> {
    try {
      const result = await query()
      const entity = result[0]

      if (entity === undefined || entity === null) {
        return err({
          type: `${entityType}NotFound`,
          message: `${entityType} with ${keyDescription} not found`,
          id: keyDescription,
        })
      }

      return ok(entity)
    } catch (error) {
      return err({
        type: 'DatabaseError' as const,
        message: String(error),
        operation: `get${entityType}By${keyDescription.replace(/\s+/g, '')}`,
      })
    }
  }
}

// Helper function to create database errors
export const createDatabaseError = (operation: string, error: unknown): DatabaseError => ({
  type: 'DatabaseError' as const,
  message: String(error),
  operation,
})

// Common NotFound error interface
export interface NotFoundError {
  readonly type: string
  readonly message: string
  readonly id: string
}

// Helper to create NotFound errors
export const createNotFoundError = (entityType: string, id: string): NotFoundError => ({
  type: `${entityType}NotFound`,
  message: `${entityType} with ID ${id} not found`,
  id,
})
