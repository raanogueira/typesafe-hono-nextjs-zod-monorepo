// Common schema utilities and types for financial applications
import { pgEnum } from 'drizzle-orm/pg-core'

// Common financial enums that can be reused across projects
export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'processing',
  'settled',
  'failed',
  'cancelled',
  'reversed',
])

export const transactionTypeEnum = pgEnum('transaction_type', [
  'buy',
  'sell',
  'dividend',
  'split',
  'transfer_in',
  'transfer_out',
])

export const accountTypeEnum = pgEnum('account_type', ['taxable', 'ira', 'roth_ira', '401k'])

export const currencyEnum = pgEnum('currency', ['USD', 'EUR', 'BRL', 'GBP'])

export const healthStatusEnum = pgEnum('health_status', [
  'healthy',
  'unhealthy',
  'degraded',
  'unknown',
])

// Enum type inference helpers
export type TransactionStatus = (typeof transactionStatusEnum.enumValues)[number]
export type TransactionType = (typeof transactionTypeEnum.enumValues)[number]
export type AccountType = (typeof accountTypeEnum.enumValues)[number]
export type Currency = (typeof currencyEnum.enumValues)[number]
export type HealthStatus = (typeof healthStatusEnum.enumValues)[number]

// Common column helpers
export const auditColumns = {
  createdAt: (): { withTimezone: true; mode: 'date' } => ({
    withTimezone: true,
    mode: 'date' as const,
  }),
  updatedAt: (): { withTimezone: true; mode: 'date' } => ({
    withTimezone: true,
    mode: 'date' as const,
  }),
}

// Financial column helpers (always use cents to avoid floating point errors)
export const moneyColumns = {
  balanceCents: 'integer',
  priceCents: 'integer',
  totalCostCents: 'integer',
} as const
