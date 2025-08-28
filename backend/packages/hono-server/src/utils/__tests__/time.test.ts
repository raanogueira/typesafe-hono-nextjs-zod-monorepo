import { describe, it, expect, beforeEach } from 'vitest'
import {
  setTimeProvider,
  getCurrentTimeUTC,
  getCurrentDateUTC,
  createRealTimeProvider,
  createTestTimeProvider,
  type ISODateTimeUTC,
} from '../time'

describe('TimeProvider', () => {
  beforeEach(() => {
    // Reset to real time provider before each test
    setTimeProvider(createRealTimeProvider())
  })

  it('createRealTimeProvider returns current system time', () => {
    const provider = createRealTimeProvider()
    const before = new Date()
    const result = provider.getCurrentDateUTC()
    const after = new Date()

    expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(result.getTime()).toBeLessThanOrEqual(after.getTime())
  })

  it('createRealTimeProvider returns ISO string time', () => {
    const provider = createRealTimeProvider()
    const result = provider.getCurrentTimeUTC()

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    expect(new Date(result)).toBeInstanceOf(Date)
  })

  it('createTestTimeProvider uses fixed time', () => {
    const fixedDate = new Date('2024-01-01T12:00:00.000Z')
    const provider = createTestTimeProvider(fixedDate)

    const dateResult = provider.getCurrentDateUTC()
    const timeResult = provider.getCurrentTimeUTC()

    expect(dateResult.toISOString()).toBe('2024-01-01T12:00:00.000Z')
    expect(timeResult).toBe('2024-01-01T12:00:00.000Z' as ISODateTimeUTC)
  })

  it('createTestTimeProvider uses default time when no time provided', () => {
    const provider = createTestTimeProvider()

    const result = provider.getCurrentTimeUTC()

    expect(result).toBe('2024-01-01T12:00:00.000Z' as ISODateTimeUTC)
  })

  it('global time provider can be set and used', () => {
    const fixedDate = new Date('2025-12-31T23:59:59.999Z')
    const testProvider = createTestTimeProvider(fixedDate)

    setTimeProvider(testProvider)

    const dateResult = getCurrentDateUTC()
    const timeResult = getCurrentTimeUTC()

    expect(dateResult.toISOString()).toBe('2025-12-31T23:59:59.999Z')
    expect(timeResult).toBe('2025-12-31T23:59:59.999Z' as ISODateTimeUTC)
  })

  it('time provider is injectable for testing consistency', () => {
    // Set to test provider
    const testProvider = createTestTimeProvider(new Date('2024-06-15T10:30:00.000Z'))
    setTimeProvider(testProvider)

    // Should now return fixed time
    const testTime = getCurrentTimeUTC()
    expect(testTime).toBe('2024-06-15T10:30:00.000Z' as ISODateTimeUTC)

    // Reset to real time
    setTimeProvider(createRealTimeProvider())
    const realTime2 = getCurrentTimeUTC()

    // Should be different from test time
    expect(realTime2).not.toBe(testTime)
  })
})

describe('ISODateTimeUTC type safety', () => {
  it('branded type prevents mixing with regular strings', () => {
    const provider = createTestTimeProvider()
    const isoTime = provider.getCurrentTimeUTC()

    // This would be a TypeScript error if types were checked:
    // const regularString: string = isoTime  // ✅ This works (branded types are assignable to base type)
    // const brandedTime: ISODateTimeUTC = 'regular-string'  // ❌ This would be a TypeScript error

    expect(typeof isoTime).toBe('string')
    expect(isoTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })
})
