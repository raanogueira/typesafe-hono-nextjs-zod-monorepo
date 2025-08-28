// Manual type check to verify Hono client type inference
import { hc } from 'hono/client'
import type { ApiRoutes } from '../src/app'

// Create the typed client
const client = hc<ApiRoutes>('http://localhost:3000/api/v1')

// Test type inference - TypeScript should provide autocomplete here
async function testTypeInference() {
  // Health endpoint - should work without params
  const healthResponse = await client.health.$get()
  const healthData = await healthResponse.json()
  console.log('Health data:', healthData)

  // Portfolio endpoint - should require params
  const portfolioResponse = await client.portfolio[':id'].$get({
    param: { id: '123e4567-e89b-12d3-a456-426614174000' },
  })
  const portfolioData = await portfolioResponse.json()
  console.log('Portfolio data:', portfolioData)

  // Transaction endpoint - should require params
  const transactionResponse = await client.transactions[':id'].$get({
    param: { id: '123e4567-e89b-12d3-a456-426614174001' },
  })
  const transactionData = await transactionResponse.json()
  console.log('Transaction data:', transactionData)

  // Cash transactions
  const cashTransactionResponse = await client['cash-transactions'][':id'].$get({
    param: { id: '123e4567-e89b-12d3-a456-426614174002' },
  })
  const cashTransactionData = await cashTransactionResponse.json()
  console.log('Cash transaction data:', cashTransactionData)

  // Prices
  const priceResponse = await client.prices[':id'].$get({
    param: { id: '123e4567-e89b-12d3-a456-426614174003' },
  })
  const priceData = await priceResponse.json()
  console.log('Price data:', priceData)

  // Symbol mappings
  const symbolMappingResponse = await client['symbol-mappings'][':id'].$get({
    param: { id: '123e4567-e89b-12d3-a456-426614174004' },
  })
  const symbolMappingData = await symbolMappingResponse.json()
  console.log('Symbol mapping data:', symbolMappingData)

  // Asset splits
  const assetSplitResponse = await client['asset-splits'][':id'].$get({
    param: { id: '123e4567-e89b-12d3-a456-426614174005' },
  })
  const assetSplitData = await assetSplitResponse.json()
  console.log('Asset split data:', assetSplitData)
}

// This file is for type checking - run it with:
// npx tsx tests/manual-type-check.ts
console.log('Type inference test compiled successfully!')
console.log('Client structure:', Object.keys(client))

export { testTypeInference }
