import { describe, it, expect } from 'vitest'
import {
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
} from '../../schema-utilities'

describe('Schema Enums', () => {
  describe('transactionStatusEnum', () => {
    it('contains expected transaction status values', () => {
      const expectedStatuses = [
        'pending',
        'processing',
        'settled',
        'failed',
        'cancelled',
        'reversed',
      ]

      // Test that the enum contains expected values
      expectedStatuses.forEach((status) => {
        expect(transactionStatusEnum.enumValues).toContain(status)
      })
    })

    it('has correct type definition', () => {
      // TypeScript compile-time test
      const status: TransactionStatus = 'pending'
      expect(status).toBe('pending')

      // Test all valid statuses
      const validStatuses: TransactionStatus[] = [
        'pending',
        'processing',
        'settled',
        'failed',
        'cancelled',
        'reversed',
      ]
      validStatuses.forEach((s) => {
        expect(typeof s).toBe('string')
      })
    })
  })

  describe('transactionTypeEnum', () => {
    it('contains expected transaction type values', () => {
      const expectedTypes = ['buy', 'sell', 'dividend', 'split', 'transfer_in', 'transfer_out']

      expectedTypes.forEach((type) => {
        expect(transactionTypeEnum.enumValues).toContain(type)
      })
    })

    it('has correct type definition', () => {
      const type: TransactionType = 'buy'
      expect(type).toBe('buy')
    })
  })

  describe('accountTypeEnum', () => {
    it('contains expected account type values', () => {
      const expectedTypes = ['taxable', 'ira', 'roth_ira', '401k']

      expectedTypes.forEach((type) => {
        expect(accountTypeEnum.enumValues).toContain(type)
      })
    })

    it('has correct type definition', () => {
      const type: AccountType = 'taxable'
      expect(type).toBe('taxable')
    })
  })

  describe('currencyEnum', () => {
    it('contains expected currency values', () => {
      const expectedCurrencies = ['USD', 'EUR', 'BRL', 'GBP']

      expectedCurrencies.forEach((currency) => {
        expect(currencyEnum.enumValues).toContain(currency)
      })
    })

    it('has correct type definition', () => {
      const currency: Currency = 'USD'
      expect(currency).toBe('USD')
    })
  })

  describe('healthStatusEnum', () => {
    it('contains expected health status values', () => {
      const expectedStatuses = ['healthy', 'unhealthy', 'degraded', 'unknown']

      expectedStatuses.forEach((status) => {
        expect(healthStatusEnum.enumValues).toContain(status)
      })
    })

    it('has correct type definition', () => {
      const status: HealthStatus = 'healthy'
      expect(status).toBe('healthy')
    })
  })
})

describe('Column Utilities', () => {
  describe('auditColumns', () => {
    it('has correct audit column function structure', () => {
      expect(auditColumns).toHaveProperty('createdAt')
      expect(auditColumns).toHaveProperty('updatedAt')

      // Test that these are functions that return column configs
      expect(typeof auditColumns.createdAt).toBe('function')
      expect(typeof auditColumns.updatedAt).toBe('function')

      // Test return values
      const createdAtConfig = auditColumns.createdAt()
      const updatedAtConfig = auditColumns.updatedAt()

      expect(createdAtConfig).toEqual({ withTimezone: true, mode: 'date' })
      expect(updatedAtConfig).toEqual({ withTimezone: true, mode: 'date' })
    })
  })

  describe('moneyColumns', () => {
    it('has correct money column structure', () => {
      expect(moneyColumns).toHaveProperty('balanceCents')
      expect(moneyColumns).toHaveProperty('priceCents')
      expect(moneyColumns).toHaveProperty('totalCostCents')

      // Test that columns are integer types (for cents storage)
      expect(moneyColumns.balanceCents).toBe('integer')
      expect(moneyColumns.priceCents).toBe('integer')
      expect(moneyColumns.totalCostCents).toBe('integer')
    })

    it('uses integer type for precise money storage', () => {
      // All money amounts stored as cents to avoid floating point errors
      const allColumnTypes = Object.values(moneyColumns)
      allColumnTypes.forEach((type) => {
        expect(type).toBe('integer')
      })
    })
  })
})

describe('Type Safety', () => {
  it('enforces enum type constraints at compile time', () => {
    // These should compile without errors
    const validTransaction: TransactionStatus = 'pending'
    const validType: TransactionType = 'buy'
    const validAccount: AccountType = 'taxable'
    const validCurrency: Currency = 'USD'
    const validHealth: HealthStatus = 'healthy'

    expect(validTransaction).toBe('pending')
    expect(validType).toBe('buy')
    expect(validAccount).toBe('taxable')
    expect(validCurrency).toBe('USD')
    expect(validHealth).toBe('healthy')
  })

  it('provides exhaustive enum values for runtime validation', () => {
    // Can be used for runtime validation in forms, APIs, etc.
    const allTransactionStatuses = transactionStatusEnum.enumValues
    const allTransactionTypes = transactionTypeEnum.enumValues
    const allAccountTypes = accountTypeEnum.enumValues
    const allCurrencies = currencyEnum.enumValues
    const allHealthStatuses = healthStatusEnum.enumValues

    expect(allTransactionStatuses.length).toBe(6) // pending, processing, settled, failed, cancelled, reversed
    expect(allTransactionTypes.length).toBe(6) // buy, sell, dividend, split, transfer_in, transfer_out
    expect(allAccountTypes.length).toBe(4) // taxable, ira, roth_ira, 401k
    expect(allCurrencies.length).toBe(4) // USD, EUR, BRL, GBP
    expect(allHealthStatuses.length).toBe(4) // healthy, unhealthy, degraded, unknown

    // Test that each array contains strings
    allTransactionStatuses.forEach((status) => expect(typeof status).toBe('string'))
    allCurrencies.forEach((currency) => expect(typeof currency).toBe('string'))
  })
})
