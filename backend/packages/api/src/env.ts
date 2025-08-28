// Core API environment - extends hono-server with domain-specific variables
import 'dotenv/config'
import { z } from 'zod'
import { honoServerEnv, type HonoServerBindings } from '@typesafe-stack/hono-server'

// API specific environment variables
const coreApiEnvSchema = z.object({
  // API Configuration (only what api actually uses)
  API_VERSION: z.string().min(1),
  DATABASE_URL: z.string().min(1),

  // Optional flag to skip database verification
  SKIP_DB_CHECK: z.string().optional(),
})

// Combined environment type: hono-server + api
export type CoreApiBindings = HonoServerBindings & z.infer<typeof coreApiEnvSchema>

/**
 * Validate core API environment - extends hono-server validation
 */
export function validateCoreApiEnv(): CoreApiBindings {
  try {
    const coreEnv = coreApiEnvSchema.parse(process.env)
    const combined: CoreApiBindings = {
      ...honoServerEnv, // hono-server env already validated
      ...coreEnv,
    }
    return combined
  } catch (error) {
    console.error('🚨 CORE API ENVIRONMENT VALIDATION FAILED!')
    console.error(error)
    process.exit(1)
  }
}

// Export validated environment - validates immediately when imported
export const env = validateCoreApiEnv()
