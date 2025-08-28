// Common error types for web applications
export type ValidationError = {
  type: 'ValidationError'
  message: string
  errors?: Array<{
    field: string
    message: string
    code: string
  }>
}

export type InvalidInput = {
  type: 'InvalidInput'
  message: string
  field?: string
}

export type NotFoundError = {
  type: 'NotFoundError'
  message: string
  resource?: string
}

export type ConflictError = {
  type: 'ConflictError'
  message: string
  resource?: string
}

export type InternalError = {
  type: 'InternalError'
  message: string
  details?: string
}

export type UnauthorizedError = {
  type: 'UnauthorizedError'
  message: string
}

export type ForbiddenError = {
  type: 'ForbiddenError'
  message: string
}

// Common HTTP error types
export type HttpError =
  | ValidationError
  | InvalidInput
  | NotFoundError
  | ConflictError
  | InternalError
  | UnauthorizedError
  | ForbiddenError
