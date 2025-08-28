// PostHog client configuration for feature flags and analytics
'use client'

import posthog from 'posthog-js'
import { env } from '#lib/env'

if (typeof window !== 'undefined' && env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // We'll capture manually for better control
    capture_pageleave: true,
  })
}

export { posthog }
