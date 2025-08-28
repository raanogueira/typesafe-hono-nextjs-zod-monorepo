'use client'

import { useFeatureFlag, usePostHog } from '#hooks/use-posthog'

export default function FeaturesPage() {
  const { isLoaded, captureEvent } = usePostHog()
  const showNewPortfolio = useFeatureFlag('new-portfolio-view')
  const showAdvancedCharts = useFeatureFlag('advanced-charts')
  const enablePremiumFeatures = useFeatureFlag('premium-features')

  const handleTestEvent = () => {
    captureEvent('feature_page_interaction', {
      button: 'test_analytics',
      timestamp: new Date().toISOString(),
    })
  }

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Feature Flags Demo</h1>
      <p className="text-gray-600 mb-8">Real-time feature toggles and A/B testing with PostHog</p>

      <div className="space-y-6">
        {/* Portfolio View Feature */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Portfolio View</h2>
          {showNewPortfolio ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-medium text-green-800">✨ New Portfolio View (Enabled)</h3>
              <p className="text-green-700 mt-1">
                Enhanced portfolio with real-time charts and performance metrics
              </p>
              <div className="mt-3 p-3 bg-white border rounded">
                📊 Advanced Portfolio Analytics
                <br />💹 Real-time P&L Tracking
                <br />🎯 Asset Allocation Insights
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <h3 className="font-medium text-gray-700">📊 Classic Portfolio View</h3>
              <p className="text-gray-600 mt-1">Standard portfolio with basic holdings display</p>
              <div className="mt-3 p-3 bg-white border rounded">
                📋 Holdings List
                <br />💰 Total Value
                <br />📈 Basic Charts
              </div>
            </div>
          )}
        </div>

        {/* Charts Feature */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Chart Features</h2>
          {showAdvancedCharts ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-medium text-blue-800">📈 Advanced Charts (Enabled)</h3>
              <p className="text-blue-700 mt-1">Interactive charts with technical indicators</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="p-2 bg-white border rounded text-sm">📊 Candlestick</div>
                <div className="p-2 bg-white border rounded text-sm">📉 Moving Averages</div>
                <div className="p-2 bg-white border rounded text-sm">🔮 Volume Profile</div>
                <div className="p-2 bg-white border rounded text-sm">⚡ Real-time Data</div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <h3 className="font-medium text-gray-700">📊 Basic Charts</h3>
              <p className="text-gray-600 mt-1">Simple line charts</p>
            </div>
          )}
        </div>

        {/* Premium Features */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Premium Features</h2>
          {enablePremiumFeatures ? (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <h3 className="font-medium text-purple-800">💎 Premium Unlocked</h3>
              <p className="text-purple-700 mt-1">Access to advanced financial tools</p>
              <div className="mt-3 space-y-2">
                <div className="p-2 bg-white border rounded">🤖 AI Portfolio Optimization</div>
                <div className="p-2 bg-white border rounded">📊 Risk Analytics</div>
                <div className="p-2 bg-white border rounded">💼 Tax Loss Harvesting</div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <h3 className="font-medium text-gray-700">🔒 Premium Features</h3>
              <p className="text-gray-600 mt-1">Upgrade for advanced tools</p>
              <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Upgrade to Premium
              </button>
            </div>
          )}
        </div>

        {/* Analytics Test */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Analytics Test</h2>
          <button
            onClick={handleTestEvent}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            📊 Send Test Event
          </button>
          <p className="text-sm text-gray-600 mt-2">Click to test PostHog event tracking</p>
        </div>

        {/* Feature Flag Status */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">Feature Flag Status</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              new-portfolio-view:{' '}
              <span className={showNewPortfolio ? 'text-green-600' : 'text-red-600'}>
                {String(showNewPortfolio)}
              </span>
            </div>
            <div>
              advanced-charts:{' '}
              <span className={showAdvancedCharts ? 'text-green-600' : 'text-red-600'}>
                {String(showAdvancedCharts)}
              </span>
            </div>
            <div>
              premium-features:{' '}
              <span className={enablePremiumFeatures ? 'text-green-600' : 'text-red-600'}>
                {String(enablePremiumFeatures)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
