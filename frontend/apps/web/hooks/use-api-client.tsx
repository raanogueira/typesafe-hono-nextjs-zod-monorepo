/**
 * API Client Context for Dependency Injection
 * Eliminates prop drilling and centralizes client configuration
 */
'use client'

import React, { createContext, useContext, type ReactNode } from 'react'
import { type CoreApiClient } from '@typesafe-stack/api-client'
import { apiClient } from '#lib/api-client'

interface ApiClientContextType {
  client: CoreApiClient
}

const ApiClientContext = createContext<ApiClientContextType | null>(null)

/**
 * Provider component that injects API client into React tree
 */
export function ApiClientProvider({
  children,
  client = apiClient, // Default to singleton, but allow override for testing
}: {
  children: ReactNode
  client?: CoreApiClient
}) {
  return <ApiClientContext.Provider value={{ client }}>{children}</ApiClientContext.Provider>
}

/**
 * Hook to get the current API client
 * Eliminates need to pass client as prop to every hook
 */
export function useApiClient(): CoreApiClient {
  const context = useContext(ApiClientContext)

  if (!context) {
    throw new Error('useApiClient must be used within an ApiClientProvider')
  }

  return context.client
}
