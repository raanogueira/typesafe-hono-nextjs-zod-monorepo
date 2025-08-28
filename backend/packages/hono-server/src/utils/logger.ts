import pino from 'pino'
import { honoServerEnv } from '#config/server-env'

export const LogLevel = {
  Debug: 'debug',
  Info: 'info',
  Warn: 'warn',
  Error: 'error',
} as const

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel]

export interface LogContext {
  component?: string
  requestId?: string
  method?: string
  path?: string
  userAgent?: string
  [key: string]: unknown
}

export const createLogger = (
  context: LogContext = {}
): {
  debug: (message: string, meta?: Record<string, unknown>) => void
  info: (message: string, meta?: Record<string, unknown>) => void
  warn: (message: string, meta?: Record<string, unknown>) => void
  error: (message: string, meta?: Record<string, unknown>) => void
} => {
  const isDevelopment = honoServerEnv.NODE_ENV === 'development'

  const pinoOptions = {
    level: honoServerEnv.LOG_LEVEL,
    formatters: {
      level: (label: string): { level: string } => {
        return { level: label }
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }

  // Add transport only if in development
  const baseLogger = isDevelopment
    ? pino({
        ...pinoOptions,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      })
    : pino(pinoOptions)

  const childLogger = baseLogger.child(context)

  return {
    debug: (message: string, meta: Record<string, unknown> = {}): void => {
      childLogger.debug(meta, message)
    },
    info: (message: string, meta: Record<string, unknown> = {}): void => {
      childLogger.info(meta, message)
    },
    warn: (message: string, meta: Record<string, unknown> = {}): void => {
      childLogger.warn(meta, message)
    },
    error: (message: string, meta: Record<string, unknown> = {}): void => {
      childLogger.error(meta, message)
    },
  }
}
