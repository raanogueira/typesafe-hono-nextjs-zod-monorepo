// Transactions schemas for validation and OpenAPI
import { z } from 'zod'

// Transaction response schema - matches database structure
export const TransactionResponseSchema = z.object({
  id: z.string().uuid(),
  portfolioId: z.string().uuid(),
  date: z.string(),
  symbol: z.string(),
  transactionType: z.string(),
  quantity: z.string(),
  price: z.string(),
  currency: z.string(),
  fee: z.string().optional().nullable(),
  broker: z.string(),
  createdAt: z.string().datetime().optional().nullable(),
  source: z.string(),
})

export const TransactionRequestSchema = z.object({
  id: z.string().uuid('Invalid transaction ID format'),
})

// Export type for TypeScript inference
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>
export type TransactionRequest = z.infer<typeof TransactionRequestSchema>
