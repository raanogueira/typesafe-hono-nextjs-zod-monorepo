import type { Context } from 'hono'
import type { Result } from '#types/result'
import type { HttpError } from '#types/errors'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    type: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    version?: string
  }
}

/**
 * Create standardized API responses
 */
export const ResponseUtil = {
  success<T>(c: Context, data: T, message?: string): Response {
    return c.json(
      {
        success: true,
        data,
        message,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      200
    )
  },

  created<T>(c: Context, data: T, message?: string): Response {
    return c.json(
      {
        success: true,
        data,
        message,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      201
    )
  },

  badRequest(c: Context, message: string, code?: string, details?: unknown): Response {
    return c.json(
      {
        success: false,
        error: {
          type: code || 'BAD_REQUEST',
          message,
          details,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      400
    )
  },

  unauthorized(c: Context, message: string, code?: string): Response {
    return c.json(
      {
        success: false,
        error: {
          type: code || 'UNAUTHORIZED',
          message,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      401
    )
  },

  forbidden(c: Context, message: string, code?: string): Response {
    return c.json(
      {
        success: false,
        error: {
          type: code || 'FORBIDDEN',
          message,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      403
    )
  },

  notFound(c: Context, message: string, code?: string): Response {
    return c.json(
      {
        success: false,
        error: {
          type: code || 'NOT_FOUND',
          message,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      404
    )
  },

  conflict(c: Context, message: string, code?: string): Response {
    return c.json(
      {
        success: false,
        error: {
          type: code || 'CONFLICT',
          message,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      409
    )
  },

  internalError(c: Context, message: string, code?: string): Response {
    return c.json(
      {
        success: false,
        error: {
          type: code || 'INTERNAL_SERVER_ERROR',
          message,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      500
    )
  },

  /**
   * Auto-convert Result<T, E> to HTTP response
   */
  fromResult<T, E extends HttpError>(c: Context, result: Result<T, E>): Response {
    return result.match(
      (value) => ResponseUtil.success(c, value),
      (error) => {
        switch (error.type) {
          case 'ValidationError':
          case 'InvalidInput':
            return ResponseUtil.badRequest(c, error.message, error.type)
          case 'NotFoundError':
            return ResponseUtil.notFound(c, error.message, error.type)
          case 'ConflictError':
            return ResponseUtil.conflict(c, error.message, error.type)
          case 'UnauthorizedError':
            return ResponseUtil.unauthorized(c, error.message, error.type)
          case 'ForbiddenError':
            return ResponseUtil.forbidden(c, error.message, error.type)
          case 'InternalError':
          default:
            return ResponseUtil.internalError(c, error.message, error.type)
        }
      }
    )
  },
} as const
