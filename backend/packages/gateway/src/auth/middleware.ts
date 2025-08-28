import type { Context, Next } from 'hono'
import { respond, type ErrorMapping } from '@typesafe-stack/hono-server'
import { validateSession } from '#auth/session-validator'

const gatewayErrorMappings: ErrorMapping = {
  MissingToken: { status: 401, code: 'MISSING_AUTH_TOKEN' },
  InvalidToken: { status: 401, code: 'INVALID_AUTH_TOKEN' },
  SessionExpired: { status: 401, code: 'SESSION_EXPIRED' },
  AuthServiceError: { status: 503, code: 'AUTH_SERVICE_UNAVAILABLE' },
} as const

export const createSessionAuthMiddleware = () => {
  return async (c: Context, next: Next): Promise<Response | void> => {
    const sessionResult = await validateSession()

    if (sessionResult.isErr()) {
      return respond(c, gatewayErrorMappings).handle(sessionResult)
    }

    const user = sessionResult.value

    c.set('user', user)
    c.set('sessionProvider', user.metadata?.['provider']?.toString() ?? 'unknown')

    await next()
  }
}
