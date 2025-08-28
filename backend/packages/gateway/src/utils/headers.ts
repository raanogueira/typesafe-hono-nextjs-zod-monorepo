import type { Result } from 'neverthrow'
import { ok } from 'neverthrow'
import { getCurrentDateUTC } from '@typesafe-stack/hono-server'
import type { UserContext, HeaderConfig, HeaderTransformResult } from '#auth/types'

export const computeHeadersToStrip = (
  incomingHeaders: Record<string, string>,
  stripPatterns: readonly string[]
): readonly string[] => {
  const headersToRemove: string[] = []

  for (const [headerName] of Object.entries(incomingHeaders)) {
    const lowerHeaderName = headerName.toLowerCase()

    for (const pattern of stripPatterns) {
      const shouldRemove = pattern.endsWith('*')
        ? lowerHeaderName.startsWith(pattern.slice(0, -1).toLowerCase())
        : lowerHeaderName === pattern.toLowerCase()

      if (shouldRemove) {
        headersToRemove.push(headerName)
        break
      }
    }
  }

  return headersToRemove
}

export const computeHeadersToInject = (
  user: UserContext,
  headerConfig: HeaderConfig['injectToService'],
  originalHeaders: Record<string, string>
): Record<string, string> => {
  const requestId = originalHeaders['x-request-id'] ?? generateRequestId()
  const forwardedFor =
    originalHeaders['x-forwarded-for'] ?? originalHeaders['cf-connecting-ip'] ?? 'unknown'

  return {
    [headerConfig.userId]: user.userId,
    [headerConfig.userRole]: user.userRole,
    [headerConfig.permissions]: user.permissions.join(','),
    [headerConfig.requestId]: requestId,
    [headerConfig.forwardedFor]: forwardedFor,
  }
}

export const computeHeaderTransformations = (
  user: UserContext,
  headerConfig: HeaderConfig,
  originalHeaders: Record<string, string>
): Result<HeaderTransformResult, never> => {
  const headersToRemove = computeHeadersToStrip(originalHeaders, headerConfig.stripFromClient)

  const headersToAdd = computeHeadersToInject(user, headerConfig.injectToService, originalHeaders)

  return ok({
    headersToAdd,
    headersToRemove,
  })
}

export const extractHeaders = (
  headerEntries: Record<string, string | undefined>
): Record<string, string> => {
  return Object.entries(headerEntries).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === 'string') {
      return { ...acc, [key.toLowerCase()]: value }
    }
    return acc
  }, {})
}

export const generateRequestId = (): string => {
  const timestamp = getCurrentDateUTC().getTime()
  return `gw_${timestamp}_${Math.random().toString(36).substring(2, 15)}`
}

export const parseCookies = (cookieHeader: string): Record<string, string> => {
  if (!cookieHeader) return {}

  const result: Record<string, string> = {}
  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...value] = cookie.trim().split('=')
    if (name !== undefined && name !== '' && name.length > 0) {
      result[name] = value.join('=')
    }
  })
  return result
}
