import { Hono } from 'hono'
import {
  startServer,
  type ServerConfig,
  respond,
  getCurrentTimeUTC,
} from '@typesafe-stack/hono-server'
import '#types/hono'
import { env } from '#config/env'
import { gatewayConfig } from '#config'
import { createSessionAuthMiddleware } from '#auth/middleware'
import { createServiceProxy } from '#utils/proxy'

const authMiddleware = createSessionAuthMiddleware()

const gatewayRouter = new Hono()

gatewayRouter.get('/_health', (c) => {
  const healthData = {
    status: 'healthy',
    timestamp: getCurrentTimeUTC(),
    version: '1.0.0',
    services: Object.fromEntries(
      Object.entries(gatewayConfig.services).map(([name, config]) => [
        name,
        config.enabled === true ? 'enabled' : 'disabled',
      ])
    ),
  }

  return respond(c).success(healthData)
})

gatewayRouter.get('/_whoami', authMiddleware, (c) => {
  const user = c.get('user')
  const provider = c.get('sessionProvider')

  return respond(c).success({
    user: {
      userId: user.userId,
      userRole: user.userRole,
      permissions: user.permissions,
    },
    provider,
    authenticated: true,
  })
})

// Service-specific router with auth required for all routes
const serviceRouter = new Hono()
serviceRouter.use('*', authMiddleware)

// Apply default-deny routing: only explicitly allowed routes
const apiService = gatewayConfig.services['api']
if (apiService.enabled) {
  for (const route of apiService.routes) {
    serviceRouter.all(route, createServiceProxy(apiService.upstream))
  }
}

const app = new Hono()

app.route('/', gatewayRouter)
app.route('/', serviceRouter)

const serverConfig: ServerConfig = {
  port: env.GATEWAY_PORT,
  host: '0.0.0.0',
}

void startServer(app, serverConfig)
