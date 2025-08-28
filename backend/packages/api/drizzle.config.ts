// Drizzle configuration for schema management and migrations
// Connects to your existing Supabase instance

import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/tables/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: '127.0.0.1',
    port: 54321,
    user: 'postgres',
    password: 'postgres',
    database: 'typesafe_stack',
  },
  verbose: true,
  strict: true,
} satisfies Config
