// Clean semantic types - zero boilerplate property tests
import fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import type { ProfileId, UserId } from '@/types/branded-types'

describe('Semantic Types - Property-Based Tests', () => {
  // Property: Works exactly like strings
  it('works exactly like strings in all contexts', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (rawId) => {
        const profileId = rawId as ProfileId

        // String operations work directly
        expect(profileId.length).toBe(rawId.length)
        expect(profileId.toUpperCase()).toBe(rawId.toUpperCase())
        expect(`Profile: ${profileId}`).toBe(`Profile: ${rawId}`)

        // JSON serialization works perfectly
        expect(JSON.stringify({ id: profileId })).toBe(JSON.stringify({ id: rawId }))
      })
    )
  })

  // Property: Database casting pattern works
  it('database casting works cleanly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (profileRawId, userRawId) => {
          // Database row simulation
          const dbRow = {
            profile_id: profileRawId,
            user_id: userRawId,
            name: 'Test User',
          }

          // Clean casting - no boilerplate
          const profileId = dbRow.profile_id as ProfileId
          const userId = dbRow.user_id as UserId

          // Values are preserved exactly
          expect(profileId).toBe(profileRawId)
          expect(userId).toBe(userRawId)
        }
      )
    )
  })

  // Property: Type safety is compile-time only
  it('demonstrates runtime behavior (compile-time safety)', () => {
    const profileId = 'profile-123' as ProfileId
    const userId = 'user-456' as UserId

    // At runtime, they're just strings
    expect(typeof profileId).toBe('string')
    expect(typeof userId).toBe('string')

    // But TypeScript prevents this at compile time:
    // function takeProfileId(id: ProfileId) { return id }
    // takeProfileId(userId) // ❌ Compile error!

    // This test documents the design - type safety without runtime cost
    expect(profileId).toBe('profile-123')
    expect(userId).toBe('user-456')
  })
})

// Simple arbitraries - no boilerplate needed
export const profileIdArbitrary = fc.string({ minLength: 1 }).map((s) => s as ProfileId)
export const userIdArbitrary = fc.string({ minLength: 1 }).map((s) => s as UserId)
