// Transactions repository with strongly typed getById method
import { eq } from 'drizzle-orm'
import { BaseRepository, type DatabaseError, type NotFoundError } from '@typesafe-stack/db-toolkit'
import { db } from '#db/connection'
import { transactions, type Transaction } from '#db/tables/transactions'
import type { Result } from '@typesafe-stack/hono-server'

export class TransactionsRepository extends BaseRepository {
  /**
   * Get transaction by ID - returns NotFound error if not found
   */
  async getById(id: string): Promise<Result<Transaction, DatabaseError | NotFoundError>> {
    return this.executeGetById('Transaction', id, () =>
      db.select().from(transactions).where(eq(transactions.id, id)).limit(1)
    )
  }
}
