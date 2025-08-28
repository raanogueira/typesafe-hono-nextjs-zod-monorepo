import { serve } from '@hono/node-server'
import type { Hono } from 'hono'
import { initializeLogger, type LoggerConfig, type ContextualLogger } from '#server/logger'
import { honoServerEnv } from '#config/server-env'

export interface ServerConfig {
  port: number
  host?: string
  logger?: LoggerConfig
  gracefulShutdownTimeoutMs?: number
  service?: {
    name: string
    version: string
  }
}

export interface ServerInstance {
  logger: ContextualLogger
  shutdown: () => void
}

/**
 * Start HTTP server with comprehensive configuration and graceful shutdown
 */
export const startServer = (app: Hono, config: ServerConfig): ServerInstance => {
  const { port, host = '0.0.0.0', gracefulShutdownTimeoutMs = 3000 } = config

  // Initialize logger
  const loggerConfig: LoggerConfig = {
    service: config.service?.name ?? config.logger?.service ?? 'api',
    version: config.service?.version ?? config.logger?.version ?? '1.0.0',
    enablePrettyPrint: config.logger?.enablePrettyPrint ?? honoServerEnv.NODE_ENV === 'development',
    enableColors: config.logger?.enableColors ?? true,
  }

  if (config.logger?.level) {
    loggerConfig.level = config.logger.level
  }

  if (config.logger?.customContext) {
    loggerConfig.customContext = config.logger.customContext
  }

  const logger = initializeLogger(loggerConfig)

  logger.info('Starting server', {
    service: config.service?.name || 'api',
    version: config.service?.version || '1.0.0',
    host,
    port,
    environment: honoServerEnv.NODE_ENV,
  })

  // Start the server
  let server: ReturnType<typeof serve> | undefined

  try {
    server = serve({
      fetch: app.fetch,
      port,
      hostname: host,
    })
  } catch (error) {
    logger.error('Failed to start server', error)
    process.exit(1)
  }

  // Graceful shutdown handling
  let shuttingDown = false

  const gracefulShutdown = (signal: string): void => {
    if (shuttingDown) {
      logger.info(`Already shutting down, ignoring ${signal}`)
      return
    }
    shuttingDown = true

    logger.info(`Received ${signal}, starting graceful shutdown...`)

    // Close the server
    logger.info('Closing HTTP server...')
    try {
      server.close(() => {
        logger.info('HTTP server closed gracefully')
        logger.info('Goodbye!')
        process.exit(0)
      })
    } catch (error) {
      logger.error('Error closing server', error)
      process.exit(1)
    }

    // Force exit after timeout
    setTimeout(() => {
      logger.warn('Force exit after timeout')
      process.exit(1)
    }, gracefulShutdownTimeoutMs)
  }

  // Manual shutdown function
  const shutdown = (): void => {
    gracefulShutdown('MANUAL')
  }

  // Register signal handlers
  process.on('SIGINT', () => gracefulShutdown('SIGINT')) // Ctrl+C
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM')) // Kill command
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')) // tsx/nodemon restart
  process.on('SIGHUP', () => gracefulShutdown('SIGHUP')) // Terminal close

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', error)
    logger.info('Shutting down due to uncaught exception')
    process.exit(1)
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', reason, { promise: promise.toString() })
    logger.info('Shutting down due to unhandled promise rejection')
    process.exit(1)
  })

  return {
    logger,
    shutdown,
  }
}
