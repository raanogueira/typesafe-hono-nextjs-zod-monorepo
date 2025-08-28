'use client'

import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'
import { ApiClientProvider } from '#hooks/use-api-client'
import { PostHogProvider } from 'posthog-js/react'
import { posthog } from '#lib/posthog'

/**
 * Global providers for SWR and API client
 * Sets up error handling, default options, and dependency injection
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <ApiClientProvider>
        <SWRConfig
          value={{
            // Refresh data on window focus for real-time updates
            revalidateOnFocus: true,
            // Don't retry on error by default (handle errors explicitly)
            shouldRetryOnError: false,
            // Error handler for all SWR hooks
            onError: (error: unknown) => {
              // In production, this would be sent to an error tracking service
              // eslint-disable-next-line no-console
              console.error('SWR Error:', error)
            },
          }}
        >
          {children}
        </SWRConfig>
      </ApiClientProvider>
    </PostHogProvider>
  )
}
