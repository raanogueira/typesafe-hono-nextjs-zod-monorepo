import { NextResponse } from 'next/server'
import { fromPromise } from 'neverthrow'
import { env } from '#lib/env'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    checks: {
      server: 'ok',
      api: 'pending',
    },
  }

  // Check API connectivity if configured using Result<> pattern
  const apiUrl = env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const checkApiResult = await fromPromise(
      fetch(`${apiUrl}/live`, {
        signal: controller.signal,
      }),
      (error) => (error instanceof Error ? error.message : 'API check failed')
    )

    clearTimeout(timeout)

    checkApiResult.match(
      (response) => {
        health.checks.api = response.ok ? 'ok' : 'degraded'
      },
      () => {
        health.checks.api = 'unreachable'
        health.status = 'degraded'
      }
    )
  } else {
    health.checks.api = 'not_configured'
  }

  const statusCode = health.status === 'healthy' ? 200 : 503

  return NextResponse.json(health, { status: statusCode })
}
