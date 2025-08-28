/**
 * Pure fetcher functions for frontend integration
 * No React dependencies - just pure async functions that return Results
 */
import type { ClientError, CoreApiClient, Result } from './client.js'
import type { TransactionRequest, TransactionResponse } from '@typesafe-stack/api/routes/schemas'

/**
 * Generic fetcher factory for throwing pattern
 * Creates fetchers that throw on error (compatible with SWR, React Query, etc.)
 */
export function createFetcher<TRequest, TResponse>(
  apiMethod: (client: CoreApiClient, request: TRequest) => Promise<Result<TResponse, ClientError>>
) {
  return async (apiClient: CoreApiClient, request: TRequest): Promise<TResponse> => {
    const result = await apiMethod(apiClient, request)

    if (result.isErr()) {
      // Throw for compatibility with most caching libraries
      const error = new Error(result.error.message) as Error & { clientError: ClientError }
      error.clientError = result.error
      throw error
    }

    return result.value
  }
}

/**
 * Generic fetcher factory for Result pattern
 * Creates fetchers that never throw - always return Result<T,E>
 */
export function createResultFetcher<TRequest, TResponse>(
  apiMethod: (client: CoreApiClient, request: TRequest) => Promise<Result<TResponse, ClientError>>
) {
  return async (
    apiClient: CoreApiClient,
    request: TRequest
  ): Promise<Result<TResponse, ClientError>> => {
    return apiMethod(apiClient, request)
  }
}

// Transaction-specific fetchers using the generic factories
export const fetchTransaction = createFetcher<TransactionRequest, TransactionResponse>(
  (client, request) => client.getTransaction(request)
)

export const fetchTransactionResult = createResultFetcher<TransactionRequest, TransactionResponse>(
  (client, request) => client.getTransaction(request)
)
