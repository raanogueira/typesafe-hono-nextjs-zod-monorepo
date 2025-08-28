// Enhanced type safety utilities for Rust-like development experience
// Re-exports from neverthrow with additional utilities

// Core Result types from neverthrow
export { Result, ok, err, fromPromise, fromThrowable } from 'neverthrow'

import { ok, err } from 'neverthrow'
import type { Result } from 'neverthrow'

// Enhanced Result utilities
export const sequence = <T, E>(results: readonly Result<T, E>[]): Result<readonly T[], E> => {
  const values: T[] = []
  for (const result of results) {
    if (result.isErr()) {
      return err(result.error)
    }
    values.push(result.value)
  }
  return ok(values as readonly T[])
}

// Custom combinators
export const allOk = <T, E>(results: readonly Result<T, E>[]): boolean => {
  return results.every((result: Result<T, E>): boolean => result.isOk())
}

export const allErr = <T, E>(results: readonly Result<T, E>[]): boolean => {
  return results.every((result: Result<T, E>): boolean => result.isErr())
}

export const partition = <T, E>(
  results: readonly Result<T, E>[]
): { successes: readonly T[]; failures: readonly E[] } => {
  const successes: T[] = []
  const failures: E[] = []

  for (const result of results) {
    if (result.isOk()) {
      successes.push(result.value)
    } else {
      failures.push(result.error)
    }
  }

  return {
    successes: successes as readonly T[],
    failures: failures as readonly E[],
  }
}

// Result creation helpers
export const success = <T>(value: T): Result<T, never> => ok(value)
export const failure = <E>(error: E): Result<never, E> => err(error)

// Conditional Result creation
export const resultFrom = <T, E>(
  condition: boolean,
  successValue: T,
  errorValue: E
): Result<T, E> => {
  return condition ? ok(successValue) : err(errorValue)
}

// Type-safe Result unwrapping (for when you're certain)
export const unsafeUnwrap = <T, E>(result: Result<T, E>): T => {
  if (result.isOk()) {
    return result.value
  }
  throw new Error(`Called unsafeUnwrap on Err: ${JSON.stringify(result.error)}`)
}

// Expect with custom error message
export const expect = <T, E>(result: Result<T, E>, message: string): T => {
  if (result.isOk()) {
    return result.value
  }
  throw new Error(`${message}: ${JSON.stringify(result.error)}`)
}

// Type guards
export const isOk = <T, E>(result: Result<T, E>): result is Result<T, never> => {
  return result.isOk()
}

export const isErr = <T, E>(result: Result<T, E>): result is Result<never, E> => {
  return result.isErr()
}
