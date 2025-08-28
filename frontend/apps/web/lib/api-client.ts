// Frontend API client configuration
import { createCoreApiClient } from '@typesafe-stack/api-client'

// Create API client with environment configuration
export function createApiClient() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is required but was not embedded during build')
  }
  return createCoreApiClient(apiUrl)
}

// Export singleton instance for convenience
export const apiClient = createApiClient()
