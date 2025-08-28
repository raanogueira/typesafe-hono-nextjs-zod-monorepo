/**
 * Core API Client - Type-safe frontend client
 * Clean dependency injection with generic wrapper
 */

// Core client with composition pattern - no environment dependencies
export {
  createCoreApiClient,
  createCoreApiClientWithHttp,
  createHttpClient,
} from './client.js'
export type {
  HttpClient,
  CoreApiClient,
  ApiError,
  NetworkError,
  ValidationError,
  ClientError,
  Result,
} from './client.js'

// Pure fetcher functions and factories - no React dependencies
export {
  fetchTransaction,
  fetchTransactionResult,
  createFetcher,
  createResultFetcher,
} from './hooks.js'

// Direct schema exports for advanced usage
export {
  TransactionRequestSchema,
  TransactionResponseSchema,
  type TransactionRequest,
  type TransactionResponse,
} from '@typesafe-stack/api/routes/schemas'
