// Smart response handler - Result<T, E> -> HTTP response
// Automatically maps error types to HTTP status codes
import type { Context } from 'hono'
import type { Result } from 'neverthrow'

// Error type -> HTTP status mapping
export interface ErrorMapping {
  readonly [errorType: string]: {
    readonly status: number
    readonly code: string
    readonly message?: string
  }
}

// Common domain errors with status codes
export const defaultErrorMappings: ErrorMapping = {
  // Not Found errors
  ProfileNotFound: { status: 404, code: 'PROFILE_NOT_FOUND' },
  ProfileNotFoundError: { status: 404, code: 'PROFILE_NOT_FOUND' },
  UserNotFound: { status: 404, code: 'USER_NOT_FOUND' },
  AccountNotFound: { status: 404, code: 'ACCOUNT_NOT_FOUND' },
  PortfolioNotFound: { status: 404, code: 'PORTFOLIO_NOT_FOUND' },
  TransactionNotFound: { status: 404, code: 'TRANSACTION_NOT_FOUND' },
  CashTransactionNotFound: { status: 404, code: 'CASH_TRANSACTION_NOT_FOUND' },
  PriceNotFound: { status: 404, code: 'PRICE_NOT_FOUND' },
  SymbolMappingNotFound: { status: 404, code: 'SYMBOL_MAPPING_NOT_FOUND' },
  AssetSplitNotFound: { status: 404, code: 'ASSET_SPLIT_NOT_FOUND' },

  // Validation errors
  ValidationError: { status: 400, code: 'VALIDATION_ERROR' },
  InvalidInput: { status: 400, code: 'INVALID_INPUT' },
  InvalidAmount: { status: 400, code: 'INVALID_AMOUNT' },
  ZodError: { status: 400, code: 'VALIDATION_ERROR' },

  // Business logic errors
  ConflictError: { status: 409, code: 'CONFLICT_ERROR' },
  DuplicateEmail: { status: 409, code: 'DUPLICATE_EMAIL' },
  InsufficientFunds: { status: 409, code: 'INSUFFICIENT_FUNDS' },

  // Server errors
  DatabaseError: { status: 500, code: 'DATABASE_ERROR', message: 'Internal server error' },
} as const

// Main smart response handler class
export class SmartResponse {
  constructor(
    private readonly context: Context,
    private readonly errorMappings: ErrorMapping = defaultErrorMappings
  ) {}

  // The magic method - Result<T, E> in, HTTP response out
  handle<T, E extends { readonly type: string; readonly message?: string }>(
    result: Result<T, E>,
    onSuccess?: (data: T) => Record<string, unknown> | unknown[]
  ): Response {
    return result.match(
      (data): Response => {
        if (onSuccess) {
          const customData = onSuccess(data)
          return this.success(customData)
        }
        // Cast data to the expected format for JSON serialization
        return this.success(data as Record<string, unknown> | unknown[])
      },
      (error): Response => this.error(error)
    )
  }

  // 200 OK
  success<T extends Record<string, unknown> | unknown[]>(data: T): Response {
    return this.context.json(data)
  }

  // 201 Created
  created<T>(data: T, message?: string): Response {
    return this.context.json(
      {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
        },
        ...(message !== undefined ? { message } : { message: 'Created successfully' }),
      },
      201
    )
  }

  // Maps error types to HTTP responses automatically - simplified format
  error<E extends { readonly type: string; readonly message?: string }>(error: E): Response {
    const mapping = this.errorMappings[error.type]

    if (mapping) {
      return this.context.json(
        {
          error: mapping.message ?? error.message ?? `${error.type} occurred`,
          code: mapping.code,
        },
        mapping.status as 200 | 201 | 400 | 404 | 409 | 500
      )
    }

    // Fallback for unmapped errors
    return this.context.json(
      {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      500
    )
  }
}

// Factory function - creates handler with custom mappings
export const respond = (c: Context, customMappings?: ErrorMapping): SmartResponse =>
  new SmartResponse(c, { ...defaultErrorMappings, ...customMappings })

// Export for convenience
export { SmartResponse as ResponseHandler }
