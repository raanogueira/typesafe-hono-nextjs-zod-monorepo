import type { Result } from 'neverthrow'

// User context representing authenticated session
export interface UserContext {
  readonly userId: string
  readonly userRole: string
  readonly permissions: readonly string[]
  readonly metadata?: Record<string, unknown>
}

export interface SessionValidationRequest {
  readonly cookies: Record<string, string>
  readonly headers: Record<string, string>
  readonly method: string
  readonly path: string
}

// Authentication errors
export type AuthError =
  | { readonly type: 'MissingToken'; readonly message: string }
  | { readonly type: 'InvalidToken'; readonly message: string }
  | { readonly type: 'SessionExpired'; readonly message: string }
  | { readonly type: 'AuthServiceError'; readonly message: string }

// Session validation result
export type SessionValidationResult = Result<UserContext, AuthError>

export type ValidateSessionFn = (
  _request: SessionValidationRequest
) => Promise<SessionValidationResult>

// Header configuration for request transformation
export interface HeaderConfig {
  readonly stripFromClient: readonly string[]
  readonly injectToService: {
    readonly userId: string
    readonly userRole: string
    readonly permissions: string
    readonly requestId: string
    readonly forwardedFor: string
  }
}

// Header transformation result
export interface HeaderTransformResult {
  readonly headersToAdd: Record<string, string>
  readonly headersToRemove: readonly string[]
}
