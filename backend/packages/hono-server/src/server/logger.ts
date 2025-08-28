import pino from 'pino'

export const LogLevel = {
  Debug: 'debug',
  Info: 'info',
  Warn: 'warn',
  Error: 'error',
} as const

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel]

export interface LogContext {
  readonly requestId?: string
  readonly userId?: string
  readonly operation?: string
  readonly service?: string
  readonly version?: string
  readonly component?: string
  readonly method?: string
  readonly path?: string
  readonly userAgent?: string
  readonly [key: string]: unknown
}

export interface LoggerConfig {
  level?: LogLevel | string
  service?: string
  version?: string
  enablePrettyPrint?: boolean
  enableColors?: boolean
  customContext?: LogContext
}

/**
 * Create base Pino logger with configuration
 */
const createBaseLogger = (config: LoggerConfig): pino.Logger => {
  const logLevel = config.level ?? LogLevel.Info

  const baseConfig = {
    level: logLevel,
    formatters: {
      level: (label: string): { level: string } => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }

  if (config.enablePrettyPrint === true) {
    return pino({
      ...baseConfig,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: config.enableColors ?? true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    })
  }

  return pino(baseConfig)
}

/**
 * Contextual logger that automatically includes context in all log messages
 */
export class ContextualLogger {
  private readonly logger: pino.Logger
  private readonly context: LogContext

  constructor(baseLogger: pino.Logger, context: LogContext = {}) {
    this.logger = baseLogger
    this.context = context
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext: LogContext): ContextualLogger {
    const mergedContext = { ...this.context, ...additionalContext }
    return new ContextualLogger(this.logger, mergedContext)
  }

  /**
   * Debug level logging
   */
  debug(message: string, data: Record<string, unknown> = {}): void {
    this.logger.debug({ ...this.context, ...data }, message)
  }

  /**
   * Info level logging
   */
  info(message: string, data: Record<string, unknown> = {}): void {
    this.logger.info({ ...this.context, ...data }, message)
  }

  /**
   * Warning level logging
   */
  warn(message: string, data: Record<string, unknown> = {}): void {
    this.logger.warn({ ...this.context, ...data }, message)
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, data: Record<string, unknown> = {}): void {
    const errorData =
      error instanceof Error
        ? {
            error: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error !== null && error !== undefined
          ? { error: String(error) }
          : {}

    this.logger.error({ ...this.context, ...errorData, ...data }, message)
  }
}

// =============================================================================
// LOGGER FACTORY
// =============================================================================

let globalLogger: ContextualLogger | null = null

/**
 * Initialize global logger with configuration
 * Should be called once at application startup
 */
export const initializeLogger = (config: LoggerConfig): ContextualLogger => {
  const baseLogger = createBaseLogger(config)

  const baseContext: LogContext = {
    service: config.service ?? 'api',
    version: config.version ?? '1.0.0',
    ...config.customContext,
  }

  globalLogger = new ContextualLogger(baseLogger, baseContext)
  return globalLogger
}

/**
 * Get global logger instance
 * Throws if logger hasn't been initialized
 */
export const getLogger = (): ContextualLogger => {
  if (!globalLogger) {
    throw new Error('Logger not initialized. Call initializeLogger() first.')
  }
  return globalLogger
}

/**
 * Create logger with specific context
 * Useful for request-scoped or operation-scoped logging
 */
export const createLogger = (context: LogContext = {}): ContextualLogger => {
  const base = getLogger()
  return base.child(context)
}
