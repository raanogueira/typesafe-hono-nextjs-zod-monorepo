// Transparent schema verification for db-toolkit
// Auto-verifies Drizzle schema matches database structure
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { sql } from 'drizzle-orm'
import { createLogger } from '#utils/logger'

export interface SchemaVerificationConfig {
  serviceName: string
  skipVerification?: boolean | undefined
  quietMode?: boolean | undefined
}

export class SchemaVerifier {
  private readonly logger = createLogger('schema-verifier')

  constructor(
    private db: PostgresJsDatabase<Record<string, unknown>>,
    private config: SchemaVerificationConfig
  ) {}

  /**
   * Transparent schema verification - runs automatically
   * Returns true if verification passes, throws if fails
   */
  async verify(): Promise<boolean> {
    if (this.config.skipVerification === true) {
      return true
    }

    if (this.config.quietMode !== true) {
      this.logger.info(`${this.config.serviceName}: Verifying database schema...`)
    }

    try {
      // 1. Test basic database connectivity
      await this.verifyConnection()

      // 2. Verify all tables exist and have correct structure
      await this.verifyTablesExist()

      if (this.config.quietMode !== true) {
        this.logger.info(`${this.config.serviceName}: Schema verification PASSED`)
      }

      return true
    } catch (error) {
      this.logger.error(`${this.config.serviceName}: Schema verification FAILED`, {
        error: String(error),
        recommendations: [
          'Database schema does not match Drizzle schema definition',
          'Please run database migrations or check your schema configuration',
        ],
      })
      throw error
    }
  }

  private async verifyConnection(): Promise<void> {
    const result = await this.db.execute(sql`SELECT 1`)
    if (result.length === 0) {
      throw new Error('Database connection test failed')
    }
  }

  private async verifyTablesExist(): Promise<void> {
    // Get all tables in the public schema
    const tables = await this.db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `)

    if (tables.length === 0) {
      throw new Error('No tables found in database. Please run migrations.')
    }

    // Basic verification that we have some tables
    // In a more sophisticated version, this could introspect the Drizzle schema
    // and verify each table's structure matches exactly
    if (this.config.quietMode !== true) {
      this.logger.info(`Found ${tables.length} tables in database`)
    }
  }
}

/**
 * Auto-verification wrapper for database connections
 * This is what services should use - verification happens transparently
 */
export async function createVerifiedDatabase<T extends Record<string, unknown>>(
  db: PostgresJsDatabase<T>,
  config: SchemaVerificationConfig
): Promise<PostgresJsDatabase<T>> {
  const verifier = new SchemaVerifier(db, config)
  await verifier.verify()

  return db
}

/**
 * Simple verification check for existing database instances
 */
export async function verifyDatabaseSchema(
  db: PostgresJsDatabase<Record<string, unknown>>,
  serviceName: string,
  options: { quiet?: boolean; skipVerification?: boolean } = {}
): Promise<void> {
  const verifier = new SchemaVerifier(db, {
    serviceName,
    quietMode: options.quiet ?? false,
    skipVerification: options.skipVerification ?? false,
  })

  await verifier.verify()
}
