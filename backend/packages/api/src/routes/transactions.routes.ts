// Transactions routes with automatic OpenAPI generation
import { Hono } from 'hono'
import type { Context } from 'hono'
import { describeRoute } from 'hono-openapi'
import { validateAs, respond } from '@typesafe-stack/hono-server'
import { TransactionRequestSchema } from '#routes/schemas/transactions.schemas'
import * as TransactionsService from '#services/transactions.service'

const transactionsRoutes = new Hono()

/**
 * GET /transactions/:id - Get transaction by ID with minimal boilerplate
 */
transactionsRoutes.get(
  '/:id',
  describeRoute({ description: 'Get transaction by ID' }),
  async (c: Context): Promise<Response> => {
    const paramResult = validateAs(TransactionRequestSchema, c.req.param())
    if (paramResult.isErr()) return respond(c).error(paramResult.error)

    const result = await TransactionsService.getTransactionById(paramResult.value.id)
    return respond(c).handle(result)
  }
)

export { transactionsRoutes }
