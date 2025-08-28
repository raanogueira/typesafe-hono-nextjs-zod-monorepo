// PostHog React hooks for feature flags and analytics
'use client'

import { useEffect, useState } from 'react'
import { posthog } from '#lib/posthog'

export function useFeatureFlag(flagKey: string): boolean | null {
  const [flagValue, setFlagValue] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Get initial value
    const initialValue = posthog.isFeatureEnabled(flagKey)
    setFlagValue(initialValue ?? false)

    // Listen for flag changes
    const unsubscribe = posthog.onFeatureFlags(() => {
      const newValue = posthog.isFeatureEnabled(flagKey)
      setFlagValue(newValue ?? false)
    })

    return unsubscribe
  }, [flagKey])

  return flagValue
}

export function usePostHog() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    posthog.onFeatureFlags(() => {
      setIsLoaded(true)
    })
  }, [])

  return {
    isLoaded,
    posthog,
    captureEvent: (event: string, properties?: Record<string, any>) => {
      posthog.capture(event, properties)
    },
    identify: (userId: string, properties?: Record<string, any>) => {
      posthog.identify(userId, properties)
    },
  }
}
