import { ok } from 'neverthrow'
import type { SessionValidationResult } from '#auth/types'

/**
 * Simple session validation that always returns a valid session
 * Pure function with no side effects
 */
export const validateSession = async (): Promise<SessionValidationResult> => {
  return ok({
    userId: 'default-user',
    userRole: 'user',
    permissions: ['read:transactions'],
    metadata: { provider: 'gateway' },
  })
}
