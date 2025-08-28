// Main exports for @typesafe-stack/api package

// Export the app and its type for Hono RPC client
export { openAPIApp } from './app'
export type { ApiRoutes } from './app'

// Export transaction schema types for type-safe API communication
export type {
  TransactionResponse,
  TransactionRequest,
} from './routes/schemas/transactions.schemas'

// Re-export error types from hono-server
export type { ErrorResponse } from '@typesafe-stack/hono-server'
