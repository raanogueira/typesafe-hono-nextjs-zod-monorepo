// Type-safe client for api
import type { z } from 'zod'
import type { Result } from 'neverthrow'
import { ok, err, fromPromise } from 'neverthrow'

// Re-export Result for advanced users
export type { Result } from 'neverthrow'
import type { TransactionResponse } from '@typesafe-stack/api/routes/schemas'
import {
  type TransactionRequest,
  TransactionRequestSchema,
  TransactionResponseSchema,
} from '@typesafe-stack/api/routes/schemas'

// Error types following discriminated union pattern
export type ApiError = {
  readonly type: 'ApiError'
  readonly statusCode: number
  readonly message: string
  readonly endpoint: string
}

export type NetworkError = {
  readonly type: 'NetworkError'
  readonly message: string
  readonly url: string
}

export type ValidationError = {
  readonly type: 'ValidationError'
  readonly message: string
  readonly field?: string
}

export type ClientError = ApiError | NetworkError | ValidationError

// Generic HTTP client for type-safe API operations
export interface HttpClient {
  get<TRequest, TResponse>(
    path: string,
    requestSchema: z.ZodSchema<TRequest>,
    responseSchema: z.ZodSchema<TResponse>,
    request: TRequest
  ): Promise<Result<TResponse, ClientError>>
}

// Create a generic HTTP client with injected base URL
export function createHttpClient(baseUrl: string): HttpClient {
  return {
    async get<TRequest, TResponse>(
      path: string,
      requestSchema: z.ZodSchema<TRequest>,
      responseSchema: z.ZodSchema<TResponse>,
      request: TRequest
    ): Promise<Result<TResponse, ClientError>> {
      // Validate input
      const requestValidation = requestSchema.safeParse(request)
      if (!requestValidation.success) {
        return err({
          type: 'ValidationError' as const,
          message: `Invalid request: ${requestValidation.error.message}`,
          field: 'request',
        })
      }

      const url = `${baseUrl}${path}`

      // Convert fetch to Result
      const responseResult = await fromPromise(fetch(url), (error) => ({
        type: 'NetworkError' as const,
        message: `Network error: ${String(error)}`,
        url,
      }))

      if (responseResult.isErr()) {
        return err(responseResult.error)
      }

      const response = responseResult.value

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        return err({
          type: 'ApiError' as const,
          statusCode: response.status,
          message: errorText,
          endpoint: url,
        })
      }

      // Parse JSON and validate with schema
      const jsonResult = await fromPromise(response.json(), (error) => ({
        type: 'NetworkError' as const,
        message: `Failed to parse JSON: ${String(error)}`,
        url,
      }))

      if (jsonResult.isErr()) {
        return err(jsonResult.error)
      }

      // Validate response with Zod schema
      const validationResult = responseSchema.safeParse(jsonResult.value)
      if (!validationResult.success) {
        return err({
          type: 'ValidationError' as const,
          message: `Invalid response format: ${validationResult.error.message}`,
          field: 'response',
        })
      }

      return ok(validationResult.data)
    },
  }
}

// Core API Client using composition
export interface CoreApiClient {
  getTransaction(request: TransactionRequest): Promise<Result<TransactionResponse, ClientError>>
}

// Create Core API client using composition
export function createCoreApiClientWithHttp(httpClient: HttpClient): CoreApiClient {
  return {
    async getTransaction(
      request: TransactionRequest
    ): Promise<Result<TransactionResponse, ClientError>> {
      return httpClient.get(
        `/api/v1/transactions/${request.id}`,
        TransactionRequestSchema,
        TransactionResponseSchema,
        request
      )
    },
  }
}

// Factory function for creating Core API client
export function createCoreApiClient(baseUrl: string): CoreApiClient {
  const httpClient = createHttpClient(baseUrl)
  return createCoreApiClientWithHttp(httpClient)
}

// Interfaces are already exported above - no need to re-export
