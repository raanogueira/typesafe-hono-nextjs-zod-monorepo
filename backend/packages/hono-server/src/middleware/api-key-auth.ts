// API Key authentication middleware for OpenAPI docs
import type { Context, Next } from 'hono'
import { getCurrentTimeUTC } from '#utils/time'

export const apiKeyAuth = (
  apiKey: string
): ((c: Context, next: Next) => Promise<Response | undefined>) => {
  return async (c: Context, next: Next): Promise<Response | undefined> => {
    const providedKey = c.req.query('api_key') ?? c.req.header('X-API-Key')

    if (!providedKey || providedKey.trim() === '') {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'API key required. Provide via ?api_key=KEY or X-API-Key header',
          },
          meta: {
            timestamp: getCurrentTimeUTC(),
          },
        },
        401
      )
    }

    if (providedKey.trim() !== apiKey) {
      return c.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Invalid API key',
          },
          meta: {
            timestamp: getCurrentTimeUTC(),
          },
        },
        403
      )
    }

    await next()
    return undefined
  }
}
