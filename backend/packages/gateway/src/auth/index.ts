// Functional session authentication - clean API exports
export type {
  UserContext,
  SessionValidationRequest,
  SessionValidationResult,
  AuthError,
  HeaderConfig,
  ValidateSessionFn,
} from '#auth/types'

export { validateSession } from '#auth/session-validator'
export { createSessionAuthMiddleware } from '#auth/middleware'
export { extractHeaders } from '#utils/headers'
