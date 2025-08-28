/**
 * Generic SWR hooks for API data fetching
 * Consolidates common patterns and reduces boilerplate
 */
import useSWR, { type SWRConfiguration } from 'swr'
import { type CoreApiClient, type ClientError, type Result } from '@typesafe-stack/api-client'
import { useApiClient } from './use-api-client'

/**
 * Generic SWR hook factory
 * Creates type-safe hooks for any API endpoint with consistent patterns
 * Uses context for client injection - no prop drilling required
 */
export function createSWRHook<TRequest, TResponse>(
  endpoint: string,
  fetcher: (client: CoreApiClient, request: TRequest) => Promise<TResponse>
) {
  return function useEndpoint(
    request: TRequest,
    config?: SWRConfiguration<TResponse, ClientError>
  ) {
    const apiClient = useApiClient()

    // Generate consistent cache key
    const key = request ? `${endpoint}-${JSON.stringify(request)}` : null

    return useSWR<TResponse, ClientError>(
      key,
      async () => {
        if (!request) throw new Error(`No request provided for ${endpoint}`)
        return fetcher(apiClient, request)
      },
      config
    )
  }
}

/**
 * Generic SWR hook factory for Result<T,E> pattern
 * Never throws - always returns Result for manual error handling
 * Uses context for client injection - no prop drilling required
 */
export function createSWRResultHook<TRequest, TResponse>(
  endpoint: string,
  fetcher: (client: CoreApiClient, request: TRequest) => Promise<Result<TResponse, ClientError>>
) {
  return function useEndpointResult(
    request: TRequest,
    config?: SWRConfiguration<Result<TResponse, ClientError>, never>
  ) {
    const apiClient = useApiClient()

    // Generate consistent cache key with result suffix
    const key = request ? `${endpoint}-result-${JSON.stringify(request)}` : null

    return useSWR<Result<TResponse, ClientError>, never>(
      key,
      async () => {
        if (!request) {
          // Return error Result instead of throwing
          return {
            isOk: () => false,
            isErr: () => true,
            error: {
              type: 'ValidationError',
              message: `No request provided for ${endpoint}`,
              field: 'request',
            },
          } as Result<TResponse, ClientError>
        }
        return fetcher(apiClient, request)
      },
      config
    )
  }
}
