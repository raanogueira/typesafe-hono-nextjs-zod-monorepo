// Shared validation types - native Zod methods
import { z } from 'zod'

// Use built-in Zod validators (only keeping what's actually used)
export const email = z.string().email()
export const url = z.string().url()
export const fullName = z.string().min(2, 'Full name must be at least 2 characters')

// Common validation patterns for web applications
export const uuid = z.string().uuid()
export const nonEmptyString = z.string().min(1, 'Cannot be empty')
export const positiveInteger = z.number().int().positive()
export const nonNegativeInteger = z.number().int().min(0)
