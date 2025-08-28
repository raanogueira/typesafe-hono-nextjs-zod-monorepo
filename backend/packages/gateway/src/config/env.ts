// Gateway environment - extends hono-server with domain-specific variables
import 'dotenv/config'
import { z } from 'zod'
import { honoServerEnv, type HonoServerBindings } from '@typesafe-stack/hono-server'

// Gateway specific environment variables
const gatewayEnvSchema = z.object({
  // Gateway Configuration (only what gateway actually uses)
  GATEWAY_PORT: z.coerce.number().default(8888),
  API_KEY: z.string().min(8, 'API key must be at least 8 characters'),
  API_URL: z.string().url().default('http://localhost:10000'),

  // Service API keys
  API_KEY_AUTH: z.string().min(8, 'API key must be at least 8 characters'),
})

// Combined environment type: hono-server + gateway
export type GatewayBindings = HonoServerBindings & z.infer<typeof gatewayEnvSchema>

/**
 * Validate gateway environment - extends hono-server validation
 */
export function validateGatewayEnv(): GatewayBindings {
  const result = gatewayEnvSchema.safeParse(process.env)
  if (!result.success) {
    console.error('GATEWAY ENVIRONMENT VALIDATION FAILED!')
    console.error(result.error.message)
    process.exit(1)
  }

  const combined: GatewayBindings = {
    ...honoServerEnv, // hono-server env already validated
    ...result.data,
  }
  return combined
}

// Export validated environment - validates immediately when imported
export const env = validateGatewayEnv()
