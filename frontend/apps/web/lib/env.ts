// Frontend environment configuration - centralized
export type Env = {
  NEXT_PUBLIC_API_URL: string
  NEXT_PUBLIC_POSTHOG_KEY?: string
  NEXT_PUBLIC_POSTHOG_HOST?: string
}

export const env: Env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL!,
  ...(process.env.NEXT_PUBLIC_POSTHOG_KEY && {
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  }),
  ...(process.env.NEXT_PUBLIC_POSTHOG_HOST && {
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  }),
}
