import { describe, it, expect } from 'vitest'
import { validateSession } from '../session-validator'

describe('Session Validator', () => {
  describe('validateSession', () => {
    it('should always return a valid session', async () => {
      const result = await validateSession()

      expect(result.isOk()).toBe(true)
    })

    it('should return consistent results', async () => {
      const result1 = await validateSession()
      const result2 = await validateSession()

      expect(result1.isOk()).toBe(true)
      expect(result2.isOk()).toBe(true)
    })

    it('should be pure - no side effects', async () => {
      // Test that multiple calls don't interfere with each other
      const result1 = await validateSession()
      const result2 = await validateSession()

      expect(result1.isOk()).toBe(true)
      expect(result2.isOk()).toBe(true)
      // Results should be structurally equivalent
      if (result1.isOk() && result2.isOk()) {
        expect(JSON.stringify(result1.value)).toEqual(JSON.stringify(result2.value))
      }
    })

    it('should return Promise that resolves to Result', async () => {
      const resultPromise = validateSession()

      expect(resultPromise).toBeInstanceOf(Promise)

      const result = await resultPromise
      expect(result.isOk()).toBe(true)
    })
  })
})
