// Database connection utilities with Drizzle ORM support
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export interface DatabaseConfig {
  connectionString: string
  maxConnections?: number
  idleTimeoutMs?: number
  connectionTimeoutMs?: number
  enableLogging?: boolean
}

export const createPostgresClient = (config: DatabaseConfig): postgres.Sql => {
  return postgres(config.connectionString, {
    max: config.maxConnections ?? 10,
    idle_timeout: Number(BigInt(config.idleTimeoutMs ?? 30000) / 1000n),
    connect_timeout: Number(BigInt(config.connectionTimeoutMs ?? 10000) / 1000n),
  })
}

export const createDrizzleClient = (
  client: postgres.Sql,
  schema?: Record<string, unknown>,
  enableLogging?: boolean
): ReturnType<typeof drizzle> => {
  const config: { logger: boolean; schema?: Record<string, unknown> } = {
    logger: enableLogging ?? false,
  }
  if (schema) {
    config.schema = schema
  }
  return drizzle(client, config)
}

// Test database connection
export const testConnection = async (client: postgres.Sql): Promise<boolean> => {
  try {
    await client`SELECT 1`
    return true
  } catch {
    return false
  }
}
