#!/usr/bin/env tsx
// Schema sync utility - keeps Drizzle schema and Supabase database in sync
// Single source of truth approach

import { execSync } from 'child_process'

// Simple console logger for scripts
const logger = {
  info: (msg: string, data?: Record<string, unknown>): void =>
    console.log(`🔍 ${msg}`, data ? JSON.stringify(data) : ''),
  error: (msg: string, data?: unknown): void => console.error(`❌ ${msg}`, data),
}

async function syncSchema(databaseUrl?: string): Promise<void> {
  logger.info('Starting schema sync process')

  // 1. Test database connection
  if (databaseUrl !== null && databaseUrl !== undefined && databaseUrl !== '') {
    logger.info('Testing database connection...')
    try {
      const { createPostgresClient } = await import('../connection')
      const client = createPostgresClient({ connectionString: databaseUrl })
      const { testConnection } = await import('../connection')
      const isConnected = await testConnection(client)

      if (!isConnected) {
        logger.error('Database connection failed - cannot sync schema')
        process.exit(1)
      }
    } catch (error) {
      logger.error('Database connection setup failed', error)
      process.exit(1)
    }
  }

  logger.info('Database connection successful ✅')

  try {
    // 2. Generate migration from schema changes
    logger.info('Generating migration from schema...')
    execSync('drizzle-kit generate:pg', {
      stdio: 'inherit',
      cwd: process.cwd(),
    })

    logger.info('Migration generated ✅')

    // 3. Apply migration to database
    logger.info('Applying migration to database...')
    execSync('drizzle-kit push:pg', {
      stdio: 'inherit',
      cwd: process.cwd(),
    })

    logger.info('Migration applied ✅')

    // 4. Verify schema is in sync
    logger.info('Verifying schema sync...')
    execSync('drizzle-kit check:pg', {
      stdio: 'inherit',
      cwd: process.cwd(),
    })

    logger.info('Schema verification complete ✅')
    logger.info('🎉 Schema sync successful!')
  } catch (error) {
    logger.error('Schema sync failed', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncSchema().catch((error): void => {
    logger.error('Schema sync failed', error)
    process.exit(1)
  })
}
