#!/usr/bin/env tsx
// Simple database connection test - schema verification happens automatically
// via db-toolkit's transparent verification

import { db, dbVerificationPromise } from '#db/connection'
import { sql } from 'drizzle-orm'

async function verifyDatabaseConnection(): Promise<void> {
  try {
    // Await the automatic verification that runs on module import
    await dbVerificationPromise

    // Then test a simple query to ensure everything works
    await db.execute(sql`SELECT 1`)

    console.log('✅ Database connection and schema verification successful')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database connection or schema verification failed:', error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  verifyDatabaseConnection().catch((error) => {
    console.error('❌ Database verification script failed:', error)
    process.exit(1)
  })
}

export { verifyDatabaseConnection }
