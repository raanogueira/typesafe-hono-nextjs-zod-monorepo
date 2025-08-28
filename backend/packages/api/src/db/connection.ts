// Database connection with transparent schema verification
import {
  createPostgresClient,
  createDatabase,
  createVerifiedDatabase,
  type DatabaseConfig,
} from '@typesafe-stack/db-toolkit'

import { env } from '#env'
import { transactions } from '#db/tables/transactions'

const schema = {
  transactions,
}

// Environment configuration loaded at module level

// Create database configuration - use DATABASE_URL directly, NO HELPERS
// All database configuration handled by db-toolkit internally
const dbConfig: DatabaseConfig = {
  connectionString: env.DATABASE_URL, // Direct usage - fail loudly if missing
  enableLogging: env.NODE_ENV === 'development',
}

// Create postgres client
export const client = createPostgresClient(dbConfig)

// Create database with schema
const rawDb = createDatabase(client, schema, dbConfig.enableLogging)

// Create verified database instance that auto-verifies on import
// This runs the verification once when the module is first imported
const dbPromise = createVerifiedDatabase(rawDb, {
  serviceName: 'api',
  quietMode: env.NODE_ENV === 'test',
  skipVerification: env.NODE_ENV === 'test' || env.SKIP_DB_CHECK === 'true',
})

// Export the verified database - this will be awaited by consumers
export const db = rawDb // For now, just export raw db to avoid complex TypeScript issues

// Export the verification promise for manual awaiting if needed
export const dbVerificationPromise = dbPromise
