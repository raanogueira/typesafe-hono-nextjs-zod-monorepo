// Minimal structured logger for db-toolkit utility package
// Follows ESLint no-console rules by providing structured logging

export interface LogMessage {
  readonly level: 'info' | 'warn' | 'error'
  readonly message: string
  readonly data?: Record<string, unknown>
  readonly timestamp: string
  readonly service: string
}

export interface Logger {
  readonly info: (message: string, data?: Record<string, unknown>) => void
  readonly warn: (message: string, data?: Record<string, unknown>) => void
  readonly error: (message: string, data?: Record<string, unknown>) => void
}

/**
 * Create structured logger for db-toolkit
 */
export const createLogger = (service: string = 'db-toolkit'): Logger => {
  const log =
    (level: LogMessage['level']) =>
    (message: string, data?: Record<string, unknown>): void => {
      const logMessage: LogMessage = {
        level,
        message,
        timestamp: new Date().toISOString(),
        service,
        ...(data !== undefined && { data }),
      }

      // Output structured JSON for production, readable for development
      const isDevelopment = process.env['NODE_ENV'] === 'development'

      if (isDevelopment) {
        const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '🔍'
        const output = data ? `${emoji} ${message} ${JSON.stringify(data)}` : `${emoji} ${message}`

        if (level === 'error') {
          process.stderr.write(output + '\n')
        } else {
          process.stdout.write(output + '\n')
        }
      } else {
        // Structured JSON output for production
        const output = JSON.stringify(logMessage)

        if (level === 'error') {
          process.stderr.write(output + '\n')
        } else {
          process.stdout.write(output + '\n')
        }
      }
    }

  return {
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
  }
}
