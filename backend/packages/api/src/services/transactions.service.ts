// Transactions service - simplified without testing interfaces
import type { Result } from '@typesafe-stack/hono-server'
import type { DatabaseError, NotFoundError } from '@typesafe-stack/db-toolkit'
import type { Transaction } from '#db/tables/transactions'
import { TransactionsRepository } from '#repositories/transactions.repository'

/**
 * Get transaction by ID - returns NotFound error if not found
 */
export async function getTransactionById(
  id: string
): Promise<Result<Transaction, DatabaseError | NotFoundError>> {
  const transactionsRepo = new TransactionsRepository()
  return transactionsRepo.getById(id)
}
