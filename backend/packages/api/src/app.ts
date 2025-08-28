// Core API application
import { createApp, type RouteConfig } from '@typesafe-stack/hono-server'
import { transactionsRoutes } from '#routes/transactions.routes'
import { env } from '#env'

// Configure routes for the Core API
const routes: RouteConfig[] = [{ path: '/transactions', router: transactionsRoutes }]

export const openAPIApp = createApp(routes, {
  apiKey: env.OPENAPI_API_KEY,
})

// Export the type for Hono RPC client
export type ApiRoutes = typeof openAPIApp
