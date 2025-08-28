// Single source of truth for time operations
// Always UTC, always consistent, always injectable for testing

export type ISODateTimeUTC = string & { readonly __brand: 'ISODateTimeUTC' }

/**
 * Single function for current time - always UTC
 * Injectable for testing, consistent across the application
 */
export type TimeProvider = {
  getCurrentTimeUTC: () => ISODateTimeUTC
  getCurrentDateUTC: () => Date
}

/**
 * Production time provider - uses real system time
 */
export const createRealTimeProvider = (): TimeProvider => ({
  getCurrentTimeUTC: (): ISODateTimeUTC => getCurrentDateUTC().toISOString() as ISODateTimeUTC,
  getCurrentDateUTC: (): Date => new Date(),
})

/**
 * Global time provider - set once at app startup
 * Services use this instead of new Date()
 */
let globalTimeProvider: TimeProvider = createRealTimeProvider()

export const setTimeProvider = (provider: TimeProvider): void => {
  globalTimeProvider = provider
}

/**
 * Convenience functions that use the global provider
 * Use these throughout the application instead of new Date()
 */
export const getCurrentTimeUTC = (): ISODateTimeUTC => globalTimeProvider.getCurrentTimeUTC()
export const getCurrentDateUTC = (): Date => globalTimeProvider.getCurrentDateUTC()

/**
 * Test time provider - uses fixed/controlled time
 */
export const createTestTimeProvider = (fixedTime?: Date): TimeProvider => {
  const baseTime = fixedTime ?? new Date('2024-01-01T12:00:00.000Z')

  return {
    getCurrentTimeUTC: (): ISODateTimeUTC => {
      return baseTime.toISOString() as ISODateTimeUTC
    },
    getCurrentDateUTC: (): Date => {
      return new Date(baseTime)
    },
  }
}
