import {
  startServer as createServer,
  type ServerInstance,
  type ServerConfig,
} from '@typesafe-stack/hono-server'
import { env } from '#env' // Environment already validated at import
import { openAPIApp } from '#internal/app'

const startServer = (): ServerInstance => {
  const { PORT, NODE_ENV } = env
  // Server configuration - optimized for development experience
  const serverConfig: ServerConfig = {
    port: PORT,
    host: '0.0.0.0',
    service: {
      name: 'typesafe-stack-api',
      version: process.env['npm_package_version'] ?? '0.0.1',
    },
    logger: {
      level: env.LOG_LEVEL,
      enablePrettyPrint: NODE_ENV === 'development',
      enableColors: NODE_ENV === 'development',
      customContext:
        NODE_ENV === 'development'
          ? {}
          : {
              service: 'typesafe-stack-api',
              version: process.env['npm_package_version'] ?? '0.0.1',
              environment: NODE_ENV,
            },
    },
    gracefulShutdownTimeoutMs: NODE_ENV === 'development' ? 1000 : 5000,
  }

  return createServer(openAPIApp, serverConfig)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer()
}
