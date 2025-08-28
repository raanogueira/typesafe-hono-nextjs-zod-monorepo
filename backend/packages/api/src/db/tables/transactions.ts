// Transactions table - exact match to Supabase structure
import { pgTable, uuid, text, timestamp, numeric, date } from 'drizzle-orm/pg-core'

export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  portfolioId: uuid('portfolio_id').notNull(),
  date: date('date').notNull(),
  symbol: text('symbol').notNull(),
  transactionType: text('transaction_type').notNull(),
  quantity: numeric('quantity').notNull(),
  price: numeric('price').notNull(),
  currency: text('currency').notNull(),
  fee: numeric('fee').default('0'),
  broker: text('broker').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  source: text('source').notNull().default('imported'),
})

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
