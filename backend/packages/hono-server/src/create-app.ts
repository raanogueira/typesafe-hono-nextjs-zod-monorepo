// OpenAPI generation with hono-openapi
import { Hono, type Context, type Next } from 'hono'
import { logger } from 'hono/logger'
import { openAPISpecs } from 'hono-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import type { RequestContext } from '#utils/request-context'
import { apiKeyAuth } from '#middleware/api-key-auth'
import { getCurrentTimeUTC, getCurrentDateUTC } from '#utils/time'
import { createLogger } from '#utils/logger'

// Route configuration type
export interface RouteConfig {
  path: string
  router: Hono
}

// Create app with OpenAPI generation from provided routes
export const createApp = (routes: RouteConfig[], options: { apiKey: string }): Hono => {
  const app = new Hono()

  // Built-in Hono logger - replaces custom Pino setup
  app.use(logger())

  // Global middleware

  // Basic CORS for development
  app.use('*', async (c, next): Promise<Response | undefined> => {
    c.res.headers.set('Access-Control-Allow-Origin', '*')
    c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (c.req.method === 'OPTIONS') {
      return new Response('', { status: 204 })
    }

    await next()
    return undefined
  })

  // Request context and structured logging middleware
  app.use('*', async (c, next): Promise<undefined> => {
    const requestId = crypto.randomUUID()
    const startTime = getCurrentDateUTC().getTime()
    const method = c.req.method
    const path = c.req.path
    const userAgent = c.req.header('user-agent')

    // Create contextual logger
    const logger = createLogger({
      component: 'HttpServer',
      requestId,
      method,
      path,
      userAgent: userAgent ?? '',
    })

    // Set up request context for controllers
    const requestContext: RequestContext = {
      requestId,
      startTime,
      logger,
    }
    c.set('requestContext', requestContext)

    // Log request start
    logger.info('HTTP request started', {
      timestamp: getCurrentTimeUTC(),
    })

    await next()

    // Log request completion
    const duration = getCurrentDateUTC().getTime() - startTime
    const status = c.res.status
    const isError = status >= 400

    if (isError) {
      logger.warn('HTTP request completed with error', {
        status,
        duration: `${duration}ms`,
      })
    } else {
      logger.info('HTTP request completed successfully', {
        status,
        duration: `${duration}ms`,
      })
    }
  })

  // API versioning
  const apiV1 = new Hono()

  // Mount provided routes under API v1
  routes.forEach(({ path, router }) => {
    apiV1.route(path, router)
  })

  // Mount API v1
  app.route('/api/v1', apiV1)

  // Health checks

  // Liveness probe - indicates if container should be restarted
  app.get('/live', (c: Context): Response => {
    return c.json(
      {
        status: 'UP',
        timestamp: getCurrentTimeUTC(),
        uptime: process.uptime(),
      },
      200
    )
  })

  // OpenAPI documentation
  app.get('/openapi.json', apiKeyAuth(options.apiKey), openAPISpecs(app))

  // Swagger UI for interactive documentation
  app.get('/docs', apiKeyAuth(options.apiKey), (c: Context, next: Next) => {
    const url = new URL(c.req.url)
    const apiKey = url.searchParams.get('api_key')
    const openApiUrl =
      apiKey !== null && apiKey !== '' ? `/openapi.json?api_key=${apiKey}` : '/openapi.json'

    const swaggerUIMiddleware = swaggerUI({ url: openApiUrl })

    return swaggerUIMiddleware(c, next)
  })

  // Root endpoint

  app.get('/', (c): Response => {
    return c.json({
      success: true,
      data: {
        name: 'Capital Shield API',
        version: '1.0.0',
        description: 'Type-safe API with automatic validation',
        documentation: {
          openapi: '/openapi.json',
          swagger: '/docs',
          interactive: '/swagger',
        },
        endpoints: {
          api: '/api/v1',
          docs: '/docs',
          openapi: '/openapi.json',
        },
      },
      meta: {
        timestamp: getCurrentTimeUTC(),
        version: 'v1',
      },
    })
  })

  // Error handling

  // Global error handler - log details but don't leak to client
  app.onError((error, c): Response => {
    const requestContext = c.get('requestContext')
    const logger = requestContext.logger
    const requestId = requestContext.requestId

    // Log full error details for debugging
    logger.error('Unhandled error occurred', {
      error: error.message,
      name: error.name,
      stack: error.stack,
      requestId,
      method: c.req.method,
      path: c.req.path,
      // Include any additional error properties
      ...(error instanceof Error && 'cause' in error ? { cause: String(error.cause) } : {}),
      ...(error instanceof Error && 'code' in error
        ? { code: String((error as Error & { code: unknown }).code) }
        : {}),
    })

    // Handle validation errors - don't leak internal details
    if (error.name === 'ZodError') {
      return c.json(
        {
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
        },
        400
      )
    }

    // Check for database errors
    if (
      error.message.includes('database') ||
      error.message.includes('postgres') ||
      error.message.includes('sql')
    ) {
      return c.json(
        {
          error: 'Database operation failed',
          code: 'DATABASE_ERROR',
        },
        500
      )
    }

    // Handle other errors
    return c.json(
      {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR',
      },
      500
    )
  })

  return app
}
