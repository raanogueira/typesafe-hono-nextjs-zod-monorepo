// Type tests for error types and error handling
import { expectType, expectNotType } from 'tsd'
import {
  InvalidInput,
  NotFound,
  DatabaseError,
  ValidationError,
  ServiceError,
  ControllerError,
  invalidInput,
  notFound,
  databaseError,
  validationError,
  formatErrorMessage,
  getHttpStatusCode,
  getErrorContext,
  isInvalidInput,
  isNotFound,
} from '@/types/errors'

// Test error type construction
expectType<InvalidInput>(invalidInput('test error'))
expectType<InvalidInput>(invalidInput('test error', 'fieldName'))
expectType<NotFound>(notFound('User', '123'))
expectType<DatabaseError>(databaseError('Connection failed', 'connect'))
expectType<ValidationError>(validationError({ email: 'Invalid format' }))

// Test discriminated union types
declare const serviceError: ServiceError
declare const controllerError: ControllerError

// Test that service errors are properly discriminated
if (serviceError.type === 'InvalidInput') {
  expectType<InvalidInput>(serviceError)
  expectType<string>(serviceError.message)
  expectType<string | undefined>(serviceError.field)
}

if (serviceError.type === 'NotFound') {
  expectType<NotFound>(serviceError)
  expectType<string>(serviceError.resource)
  expectType<string>(serviceError.id)
}

if (serviceError.type === 'DatabaseError') {
  expectType<DatabaseError>(serviceError)
  expectType<string>(serviceError.message)
  expectType<string>(serviceError.operation)
}

// Test error utility functions
expectType<string>(formatErrorMessage(serviceError))
expectType<number>(getHttpStatusCode(controllerError))
expectType<Record<string, unknown>>(getErrorContext(serviceError))

// Test type guards
if (isInvalidInput(serviceError)) {
  expectType<InvalidInput>(serviceError)
  expectType<string>(serviceError.message)
}

if (isNotFound(serviceError)) {
  expectType<NotFound>(serviceError)
  expectType<string>(serviceError.resource)
  expectType<string>(serviceError.id)
}

// Test that error types are not assignable to each other
declare const invalidInputError: InvalidInput
declare const notFoundError: NotFound
declare const databaseErr: DatabaseError

expectNotType<NotFound>(invalidInputError)
expectNotType<InvalidInput>(notFoundError)
expectNotType<DatabaseError>(invalidInputError)

// Test union type assignments
expectType<ServiceError>(invalidInputError)
expectType<ServiceError>(notFoundError)
expectType<ServiceError>(databaseErr)
expectType<ControllerError>(invalidInputError) // ServiceError extends ControllerError

// Test that validation error has correct structure
declare const validationErr: ValidationError
expectType<'ValidationError'>(validationErr.type)
expectType<Record<string, string>>(validationErr.errors)

// Test optional field handling in InvalidInput
declare const inputErrWithField: InvalidInput & { field: string }
declare const inputErrWithoutField: InvalidInput & { field?: never }

expectType<string>(inputErrWithField.field)
expectType<undefined>(inputErrWithoutField.field)

// Test error constructor edge cases
expectType<InvalidInput>(invalidInput('message', undefined)) // Should handle undefined field
expectType<InvalidInput>(invalidInput('message', 'field')) // Should handle string field
