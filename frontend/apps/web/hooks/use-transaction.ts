/**
 * Transaction-specific SWR hooks
 * Built using generic hook factories for consistency
 */
import { fetchTransaction, fetchTransactionResult } from '@typesafe-stack/api-client'
import { type TransactionRequest, type TransactionResponse } from '@typesafe-stack/api-client'
import { createSWRHook, createSWRResultHook } from './use-api'

/**
 * SWR hook for fetching a transaction
 * Throws on error (standard SWR pattern)
 */
export const useTransaction = createSWRHook<TransactionRequest, TransactionResponse>(
  'transaction',
  fetchTransaction
)

/**
 * SWR hook that returns Result<T,E> directly
 * Never throws - always returns Result for manual error handling
 */
export const useTransactionResult = createSWRResultHook<TransactionRequest, TransactionResponse>(
  'transaction',
  fetchTransactionResult
)
