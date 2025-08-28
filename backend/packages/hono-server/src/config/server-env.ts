// Minimal hono-server environment - only variables actually used by hono-server
import 'dotenv/config'
import { z } from 'zod'

// Only environment variables that hono-server package actually uses
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // OpenAPI documentation (optional)
  OPENAPI_API_KEY: z.string().min(8),
})

// Hono Bindings type for server environment
export type HonoServerBindings = z.infer<typeof serverEnvSchema>

/**
 * Validate hono-server environment - fail fast on invalid config
 */
export function validateHonoServerEnv(): HonoServerBindings {
  const result = serverEnvSchema.safeParse(process.env)
  if (!result.success) {
    console.error('🚨 HONO-SERVER ENVIRONMENT VALIDATION FAILED!')
    console.error(result.error.message)
    process.exit(1)
  }
  // TypeScript now knows result.success is true, so result.data is safe
  return result.data
}

// Export validated environment - validates immediately when imported
export const honoServerEnv: HonoServerBindings = validateHonoServerEnv()
