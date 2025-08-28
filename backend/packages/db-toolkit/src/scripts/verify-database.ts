#!/usr/bin/env tsx
// Generic database verification script for any Drizzle + PostgreSQL setup
// Verifies database connectivity and basic structure

import { createPostgresClient, testConnection } from '#internal/connection'

// Simple console logger for scripts
const logger = {
  info: (msg: string, data?: Record<string, unknown>): void =>
    console.log(`🔍 ${msg}`, data ? JSON.stringify(data) : ''),
  success: (msg: string, data?: Record<string, unknown>): void =>
    console.log(`✅ ${msg}`, data ? JSON.stringify(data) : ''),
  error: (msg: string, data?: unknown): void => console.error(`❌ ${msg}`, data),
}

const withTiming = async <T>(operation: string, fn: () => Promise<T>): Promise<T> => {
  const startTime = process.hrtime.bigint()
  logger.info(`Starting ${operation}`)
  try {
    const result = await fn()
    const duration = Number((process.hrtime.bigint() - startTime) / BigInt(1000000))
    logger.success(`Completed ${operation}`, { durationMs: duration })
    return result
  } catch (error) {
    const duration = Number((process.hrtime.bigint() - startTime) / BigInt(1000000))
    logger.error(`Failed ${operation}`, { error: String(error), durationMs: duration })
    throw error
  }
}

export async function verifyDatabase(databaseUrl: string): Promise<boolean> {
  logger.info('Starting generic database verification')

  let allChecksPass = true

  try {
    // Create database client
    const client = createPostgresClient({ connectionString: databaseUrl })

    // 1. Verify database connection
    await withTiming('database connection test', async () => {
      const isConnected = await testConnection(client)
      if (!isConnected) {
        throw new Error('Database connection failed')
      }
      logger.success('Database connection successful')
    })

    // 2. Verify basic PostgreSQL functionality
    await withTiming('postgresql feature test', async () => {
      // Test basic query
      const result = await client`SELECT 1 as health_check`
      logger.success('PostgreSQL basic query working', {
        hasResult: result.length > 0,
      })

      // Test UUID generation (common in modern apps)
      const uuidResult = await client`SELECT gen_random_uuid() as test_uuid`
      logger.success('PostgreSQL UUID generation working', {
        hasUuid: uuidResult.length > 0,
      })

      // Test JSON functionality
      const jsonResult = await client`SELECT '{"test": true}'::jsonb as test_json`
      logger.success('PostgreSQL JSON functionality working', {
        hasJson: jsonResult.length > 0,
      })
    })

    // 3. List available tables (information_schema query)
    const tablesResult = await client`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    logger.info('Database tables found', {
      tableCount: tablesResult.length,
      tables: tablesResult.map((row: unknown) => (row as { table_name: string }).table_name),
    })
  } catch (error) {
    logger.error('Database verification failed', { error: String(error) })
    allChecksPass = false
  }

  // Final result
  if (allChecksPass) {
    logger.success('🎉 Database verification PASSED')
    logger.success('✅ Database connection working')
    logger.success('✅ PostgreSQL features functional')
    return true
  } else {
    logger.error('❌ Database verification FAILED')
    logger.error('Please check database connection and configuration')
    return false
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const databaseUrl = process.env['DATABASE_URL'] ?? process.argv[2]
  if (databaseUrl === null || databaseUrl === undefined || databaseUrl === '') {
    console.error('❌ DATABASE_URL environment variable or command line argument required')
    process.exit(1)
  }

  verifyDatabase(databaseUrl)
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('❌ Verification script failed:', error)
      process.exit(1)
    })
}
