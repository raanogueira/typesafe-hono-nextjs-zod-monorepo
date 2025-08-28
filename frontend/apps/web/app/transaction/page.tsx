'use client'

import Link from 'next/link'
import { useTransaction } from '#hooks/use-transaction'

/**
 * Transaction page showing a single transaction
 * Uses hardcoded ID for testing type safety
 * API client injected via context - no prop drilling needed
 */
export default function TransactionPage(): JSX.Element {
  // Hardcoded transaction ID for testing
  // This will fail at compile time if schema changes from 'id' to 'best_id'
  const hardcodedId = { id: '399d320a-79b8-4461-8141-f52631c422dc' }

  const { data: transaction, error, isLoading } = useTransaction(hardcodedId)

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Transaction Details</h1>
        <div className="text-gray-600">Loading transaction...</div>
        <div className="mt-2 text-xs text-gray-500">
          Debug: API Client configured, request: {JSON.stringify(hardcodedId)}
          <br />
          Error: {error ? JSON.stringify(error.message) : 'none'}
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Transaction Details</h1>
        <div className="text-red-600">Error loading transaction: {error.message}</div>
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">API Connection Status</h3>
          <p className="text-sm text-yellow-700">
            This error means the frontend is successfully trying to connect to the backend API. Make
            sure the backend server is running on the expected port.
          </p>
        </div>
      </main>
    )
  }

  if (!transaction) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">Transaction Details</h1>
        <div className="text-gray-600">Transaction not found</div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Transaction Details</h1>

      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID</label>
            <div className="text-sm text-gray-900 font-mono">{transaction.id}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Portfolio ID</label>
            <div className="text-sm text-gray-900 font-mono">{transaction.portfolioId}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <div className="text-sm text-gray-900">{transaction.date}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Symbol</label>
            <div className="text-sm text-gray-900 font-semibold">{transaction.symbol}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <div className="text-sm text-gray-900 capitalize">{transaction.transactionType}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <div className="text-sm text-gray-900">{transaction.quantity}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <div className="text-sm text-gray-900">${transaction.price}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Broker</label>
            <div className="text-sm text-gray-900">{transaction.broker}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fee</label>
            <div className="text-sm text-gray-900">${transaction.fee}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <div className="text-sm text-gray-900 capitalize">{transaction.source}</div>
          </div>

          {transaction.createdAt && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Created At</label>
              <div className="text-sm text-gray-900">
                {new Date(transaction.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="text-sm font-medium text-green-800 mb-2">✅ Type Safety Active</h3>
        <p className="text-sm text-green-700">
          This transaction was fetched using type-safe hooks. If you change the schema field from
          &lsquo;id&rsquo; to &lsquo;best_id&rsquo; in the backend, this frontend code will fail to
          compile, catching the breaking change at build time.
        </p>
      </div>
    </main>
  )
}
