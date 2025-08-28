import { z } from 'zod'

// Import validation utilities from hono-server
import { url, nonEmptyString } from '@typesafe-stack/hono-server'

export const ApiKeyHeaderSchema = z.object({
  'x-api-key': nonEmptyString,
})

export const ProxyRequestSchema = z.object({
  path: nonEmptyString,
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']),
  headers: z.record(z.string()).optional(),
})

export const ServiceConfigSchema = z.object({
  enabled: z.boolean(),
  upstream: url,
  routes: z.array(nonEmptyString).readonly(),
})

export const GatewayConfigSchema = z.object({
  services: z.record(ServiceConfigSchema),
  blockedRoutes: z.array(nonEmptyString).readonly(),
  security: z.object({
    requireApiKey: z.boolean(),
    apiKeyHeader: z.string(),
    apiKey: z.string().min(8),
  }),
  server: z.object({
    port: z.number(),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']),
  }),
})

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
  gateway: z.object({
    version: z.string(),
    services: z.array(z.string()),
    port: z.number(),
  }),
})

export type ServiceConfig = z.infer<typeof ServiceConfigSchema>
export type GatewayConfig = z.infer<typeof GatewayConfigSchema>
export type HealthResponse = z.infer<typeof HealthResponseSchema>
