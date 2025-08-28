// Main exports for db-toolkit package
export {
  createPostgresClient,
  testConnection,
  type DatabaseConfig,
} from '#internal/connection'

// Create Drizzle database instance
import { drizzle } from 'drizzle-orm/postgres-js'

import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type postgres from 'postgres'

export const createDatabase = (
  client: postgres.Sql,
  schema?: Record<string, unknown>,
  enableLogging?: boolean
): PostgresJsDatabase<Record<string, unknown>> => {
  // Create proper Drizzle database instance
  if (schema) {
    return drizzle(client, { schema, logger: enableLogging ?? false })
  }
  return drizzle(client, { logger: enableLogging ?? false })
}

export {
  BaseRepository,
  createDatabaseError,
  createNotFoundError,
  type DatabaseError,
  type NotFoundError,
} from '#internal/base-repository'

export {
  transactionStatusEnum,
  transactionTypeEnum,
  accountTypeEnum,
  currencyEnum,
  healthStatusEnum,
  auditColumns,
  moneyColumns,
  type TransactionStatus,
  type TransactionType,
  type AccountType,
  type Currency,
  type HealthStatus,
} from '#internal/schema-utilities'

// Schema verification - transparent and automatic
export {
  SchemaVerifier,
  createVerifiedDatabase,
  verifyDatabaseSchema,
  type SchemaVerificationConfig,
} from '#internal/schema-verification'

// Database utility scripts
export { verifyDatabase } from '#scripts/verify-database'
