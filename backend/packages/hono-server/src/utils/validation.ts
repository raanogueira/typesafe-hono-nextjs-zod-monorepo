// Result-based validation - Zod + neverthrow
// Let Zod be the core - we just wrap it with Result<T, E>
import type { z } from 'zod'
import type { Result } from 'neverthrow'
import { ok, err } from 'neverthrow'
import type { Context } from 'hono'

export type ValidationError = {
  type: 'ValidationError'
  message: string
  errors: Array<{
    field: string
    message: string
    code: string
  }>
}

export const validateAs = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): Result<z.infer<T>, ValidationError> => {
  const result = schema.safeParse(data)
  if (result.success) {
    return ok(result.data)
  }

  const errors = result.error.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
    code: issue.code,
  }))

  return err({
    type: 'ValidationError' as const,
    message: `Validation failed: ${errors.length} error(s)`,
    errors,
  })
}

export const extractAndValidate = {
  body: async <T extends z.ZodTypeAny>(
    c: Context,
    schema: T
  ): Promise<Result<z.infer<T>, ValidationError>> => {
    try {
      const data: unknown = await c.req.json()
      return validateAs(schema, data)
    } catch {
      return err({
        type: 'ValidationError' as const,
        message: 'Invalid JSON in request body',
        errors: [{ field: 'body', message: 'Invalid JSON format', code: 'invalid_json' }],
      })
    }
  },

  params: <T extends z.ZodTypeAny>(c: Context, schema: T): Result<z.infer<T>, ValidationError> => {
    return validateAs(schema, c.req.param())
  },

  query: <T extends z.ZodTypeAny>(c: Context, schema: T): Result<z.infer<T>, ValidationError> => {
    return validateAs(schema, c.req.query())
  },
}
