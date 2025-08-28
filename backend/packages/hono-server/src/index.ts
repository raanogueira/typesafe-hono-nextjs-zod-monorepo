// Main exports for hono-server package

// Core server functionality
export { createApp } from '#internal/create-app'
export type { RouteConfig } from '#internal/create-app'

// Server startup and lifecycle
export { startServer } from '#server/startup'
export type { ServerConfig, ServerInstance } from '#server/startup'

// Logging utilities
export {
  initializeLogger,
  getLogger,
  createLogger,
  ContextualLogger,
  LogLevel,
} from '#server/logger'
export type { LoggerConfig, LogContext } from '#server/logger'

// Response utilities
export { ResponseUtil } from '#utils/response'
export type { ApiResponse } from '#utils/response'

// Smart response handler - Result<T,E> -> HTTP response
export { respond, SmartResponse, ResponseHandler } from '#utils/smart-response'
export type { ErrorMapping } from '#utils/smart-response'

// Error response type for Hono RPC
export type ErrorResponse = {
  error: string
  code: string
}

// Time utilities
export {
  setTimeProvider,
  getCurrentTimeUTC,
  getCurrentDateUTC,
  createRealTimeProvider,
  createTestTimeProvider,
} from '#utils/time'
export type { TimeProvider, ISODateTimeUTC } from '#utils/time'

// Validation utilities
export { validateAs, extractAndValidate } from '#utils/validation'
export type { ValidationError } from '#utils/validation'
// Note: zValidator temporarily excluded due to complex Hono type conflicts

// Type utilities
export * from '#types/result'
export * from '#types/errors'
export * from '#types/validation'

// Request context
export type { RequestContext } from '#utils/request-context'

// Note: Script utilities moved to db-toolkit package

// Middleware utilities
export { apiKeyAuth } from '#middleware/api-key-auth'

// Server configuration
export {
  validateHonoServerEnv,
  honoServerEnv,
} from '#config/server-env'
export type { HonoServerBindings } from '#config/server-env'
