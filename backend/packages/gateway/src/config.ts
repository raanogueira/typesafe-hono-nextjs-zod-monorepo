import 'dotenv/config'
import { env } from '#config/env'
import type { HeaderConfig } from '#auth/types'

export const gatewayConfig = {
  allowedRoutes: [
    '/public/transactions',
    '/public/health',
    '/public/docs',
    '/public/openapi.json',
  ] as const,

  // Services configuration
  services: {
    api: {
      enabled: true,
      upstream: env.API_URL,
      routes: ['/api/v1/transactions/:id'] as const,
    },
  } as const,

  // Header transformation configuration
  headers: {
    stripFromClient: ['x-user-*', 'x-internal-auth', 'x-gateway-*'],
    injectToService: {
      userId: 'x-user-id',
      userRole: 'x-user-role',
      permissions: 'x-user-permissions',
      requestId: 'x-request-id',
      forwardedFor: 'x-forwarded-for',
    },
  } satisfies HeaderConfig,
} as const

export type GatewayConfig = typeof gatewayConfig
