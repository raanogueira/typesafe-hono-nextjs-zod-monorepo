import type { Context } from 'hono'
import { proxy } from 'hono/proxy'

export const createServiceProxy = (upstream: string, serviceHeaders?: Record<string, string>) => {
  return (c: Context) => {
    // Use URL constructor for proper URL building
    const queryString = c.req.raw.url.split('?').slice(1).join('?')
    const targetUrl = new URL(c.req.path + (queryString ? '?' + queryString : ''), upstream)

    return proxy(targetUrl.toString(), {
      headers: {
        ...c.req.header(),
        ...serviceHeaders,
        // Gateway headers
        'x-forwarded-for': c.req.header('x-forwarded-for') ?? 'unknown',
        via: '1.1 typesafe-stack-gateway',
      },
    })
  }
}
