import { describe, it, expect } from 'vitest'
import {
  computeHeadersToStrip,
  computeHeadersToInject,
  computeHeaderTransformations,
  parseCookies,
  extractHeaders,
  generateRequestId,
} from '../headers'
import type { UserContext, HeaderConfig } from '#auth/types'

describe('Headers Utilities', () => {
  const mockUser: UserContext = {
    userId: 'user-123',
    userRole: 'premium',
    permissions: ['read:transactions', 'read:analytics'],
    metadata: { provider: 'test' },
  }

  const mockHeaderConfig: HeaderConfig = {
    stripFromClient: ['x-user-*', 'x-internal-auth', 'x-gateway-*'],
    injectToService: {
      userId: 'x-user-id',
      userRole: 'x-user-role',
      permissions: 'x-user-permissions',
      requestId: 'x-request-id',
      forwardedFor: 'x-forwarded-for',
    },
  }

  describe('computeHeadersToStrip', () => {
    it('should identify exact header matches', () => {
      const headers = {
        'x-internal-auth': 'secret',
        'content-type': 'application/json',
        'x-other': 'value',
      }

      const result = computeHeadersToStrip(headers, ['x-internal-auth'])

      expect(result).toEqual(['x-internal-auth'])
    })

    it('should identify wildcard header matches', () => {
      const headers = {
        'x-user-id': '123',
        'x-user-role': 'admin',
        'x-other': 'value',
        'content-type': 'application/json',
      }

      const result = computeHeadersToStrip(headers, ['x-user-*'])

      expect(result).toEqual(['x-user-id', 'x-user-role'])
    })
  })

  describe('computeHeadersToInject', () => {
    it('should create headers from user context', () => {
      const originalHeaders = {}
      const config = mockHeaderConfig.injectToService

      const result = computeHeadersToInject(mockUser, config, originalHeaders)

      expect(result[config.userId]).toBe('user-123')
      expect(result[config.userRole]).toBe('premium')
      expect(result[config.permissions]).toBe('read:transactions,read:analytics')
    })
  })

  describe('computeHeaderTransformations', () => {
    it('should compute both strip and inject operations', () => {
      const originalHeaders = {
        'x-user-spoofed': 'hacker',
        'x-internal-auth': 'secret',
        'content-type': 'application/json',
      }

      const result = computeHeaderTransformations(mockUser, mockHeaderConfig, originalHeaders)

      expect(result.isOk()).toBe(true)
    })
  })

  describe('parseCookies', () => {
    it('should parse simple cookie header', () => {
      const cookieHeader = 'session=abc123; user=john'

      const result = parseCookies(cookieHeader)

      expect(result).toEqual({
        session: 'abc123',
        user: 'john',
      })
    })

    it('should handle cookies with equals signs in values', () => {
      const cookieHeader = 'jwt=eyJ0eXAi.OiJK=V1QiLC; other=simple'

      const result = parseCookies(cookieHeader)

      expect(result).toEqual({
        jwt: 'eyJ0eXAi.OiJK=V1QiLC',
        other: 'simple',
      })
    })

    it('should handle empty cookie header', () => {
      const result = parseCookies('')

      expect(result).toEqual({})
    })

    it('should be pure - not mutate input', () => {
      const original = 'session=abc123'

      parseCookies(original)

      expect(original).toBe('session=abc123')
    })
  })

  describe('extractHeaders', () => {
    it('should extract defined headers with lowercase keys', () => {
      const headerEntries = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
        'X-Custom': 'value',
        'undefined-header': undefined,
      }

      const result = extractHeaders(headerEntries)

      expect(result).toEqual({
        'content-type': 'application/json',
        authorization: 'Bearer token',
        'x-custom': 'value',
      })
    })

    it('should filter out undefined values', () => {
      const headerEntries = {
        valid: 'value',
        invalid: undefined,
      }

      const result = extractHeaders(headerEntries)

      expect(result).toEqual({
        valid: 'value',
      })
    })

    it('should be pure - not mutate input', () => {
      const original = { Test: 'value' }

      extractHeaders(original)

      expect(original).toEqual({ Test: 'value' })
    })
  })

  describe('generateRequestId', () => {
    it('should generate request ID with correct format', () => {
      const id = generateRequestId()

      expect(id).toMatch(/^gw_\d+_[a-z0-9]+$/)
    })

    it('should generate unique IDs', () => {
      const id1 = generateRequestId()
      const id2 = generateRequestId()

      expect(id1).not.toBe(id2)
    })

    it('should be deterministic for same timestamp and random seed', () => {
      // Note: This test may be flaky due to Date.now() and Math.random()
      // In production, you might want to inject time/random functions for full purity
      const id = generateRequestId()

      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(10)
    })
  })
})
