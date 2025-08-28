// Request context types for Hono application
import type { createLogger } from '#utils/logger'

export interface RequestContext {
  requestId: string
  startTime: number
  userId?: string
  logger: ReturnType<typeof createLogger> // Contextual logging with requestId
}

// Module augmentation - extends Hono's types at compile time
// This adds requestContext to c.get() and c.set() with full type safety
declare module 'hono' {
  interface ContextVariableMap {
    requestContext: RequestContext // Now c.get('requestContext') is fully typed
  }
}
